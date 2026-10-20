import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Document from '../../models/Document.js';
import Product from '../../models/Product.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';

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
  return Document.find({ userId })
    .populate({ path: 'productId', match: { userId }, select: 'name' })
    .sort({ createdAt: -1 })
    .lean();
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
  const document = await ownedDocument(userId, id);
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
