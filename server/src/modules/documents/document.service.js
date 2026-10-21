import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Document from '../../models/Document.js';
import Product from '../../models/Product.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';
import ShareGrant from '../../models/ShareGrant.js';

const uploadDirectory = fileURLToPath(
  new URL('../../../uploads/', import.meta.url),
);

function safeFilename(value) {
  return (
    [...path.basename(value || 'upload')]
      .filter((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join('')
      .slice(0, 255) || 'upload'
  );
}

export async function list(userId) {
  const grants = await ShareGrant.find({ recipientId: userId, revokedAt: null }).select('productId').lean();
  const sharedIds = await Product.find({ _id: { $in: grants.map((grant) => grant.productId) }, archivedAt: null }).distinct('_id');
  const documents = await Document.find({ $or: [{ userId }, { productId: { $in: sharedIds } }] })
    .populate({ path: 'productId', select: 'name' })
    .sort({ createdAt: -1 })
    .lean();
  return documents.map((doc) => {
    const { userId: ownerId, ...safeDocument } = doc;
    return { ...safeDocument, canDelete: String(ownerId) === String(userId) };
  });
}

export async function create(userId, file, metadata) {
  if (!file?.buffer?.length)
    throw new AppError(400, 'FILE_REQUIRED', 'Choose a document to upload');
  if (metadata.productId && !mongoose.isValidObjectId(metadata.productId)) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }
  if (
    metadata.productId &&
    !(await Product.exists({ _id: metadata.productId, userId }))
  ) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  const type = file.detectedMimeType;
  const extractedData = { ...metadata.extractedData };
  if (extractedData.purchaseDate) extractedData.purchaseDate = new Date(`${extractedData.purchaseDate}T00:00:00.000Z`);
  if (extractedData.purchasePrice === '') extractedData.purchasePrice = null;
  const extension =
    type === 'image/jpeg' ? '.jpg' : type === 'image/png' ? '.png' : '.pdf';
  const storageKey = `${randomUUID()}${extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, storageKey), file.buffer, {
    flag: 'wx',
  });
  try {
    const document = await Document.create({
      userId,
      productId: metadata.productId || null,
      type: metadata.type,
      originalFilename: safeFilename(file.originalname),
      mimeType: type,
      sizeBytes: file.size,
      storageKey,
      extractedText: metadata.extractedText || '',
      extractedData,
    });
    await recordActivity(userId, {
      entity: 'document',
      action: 'added',
      name: document.originalFilename,
      href: '/documents',
    });
    return document;
  } catch (error) {
    await unlink(path.join(uploadDirectory, storageKey)).catch(() => {});
    throw error;
  }
}

async function ownedDocument(userId, id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(404, 'NOT_FOUND', 'Document not found');
  const document = await Document.findOne({ _id: id, userId }).select(
    '+storageKey',
  );
  if (!document) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  return document;
}

export async function download(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  const sharedProductIds = await ShareGrant.find({ recipientId: userId, revokedAt: null }).distinct('productId');
  const document = await Document.findOne({ _id: id, $or: [{ userId }, { productId: { $in: sharedProductIds } }] }).select('+storageKey');
  if (!document) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  if (String(document.userId) !== String(userId) && !(await Product.exists({ _id: document.productId, archivedAt: null }))) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  try {
    return {
      document,
      buffer: await readFile(
        path.join(uploadDirectory, path.basename(document.storageKey)),
      ),
    };
  } catch {
    throw new AppError(
      404,
      'FILE_MISSING',
      'The stored file is no longer available',
    );
  }
}

export async function remove(userId, id) {
  const document = await ownedDocument(userId, id);
  await Document.deleteOne({ _id: document.id, userId });
  await unlink(
    path.join(uploadDirectory, path.basename(document.storageKey)),
  ).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  await recordActivity(userId, {
    entity: 'document',
    action: 'deleted',
    name: document.originalFilename,
    href: '/documents',
  });
}

export async function removeForProduct(userId, productId) {
  const documents = await Document.find({ userId, productId }).select(
    '+storageKey',
  );
  await Document.deleteMany({ userId, productId });
  await Promise.all(
    documents.map(async (document) => {
      await unlink(
        path.join(uploadDirectory, path.basename(document.storageKey)),
      ).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }),
  );
}
