import { AppError, success } from '../../utils/responses.js';
import { documentMetadataSchema } from './document.validation.js';
import { verifiedType } from './document.upload.js';
import * as documentService from './document.service.js';

export async function list(req, res) {
  return success(res, { documents: await documentService.list(req.user.id) });
}

export async function create(req, res) {
  const mimeType = req.file && verifiedType(req.file.buffer);
  if (!mimeType || mimeType !== req.file.mimetype) {
    throw new AppError(
      400,
      'INVALID_FILE_CONTENT',
      'The file content does not match a supported document type',
    );
  }
  const metadata = documentMetadataSchema.parse(req.body);
  const document = await documentService.create(
    req.user.id,
    { ...req.file, detectedMimeType: mimeType },
    metadata,
  );
  return success(res, { document }, 'Document uploaded');
}

export async function download(req, res) {
  const { document, buffer } = await documentService.download(
    req.user.id,
    req.params.id,
  );
  res.set({
    'Content-Type': document.mimeType,
    'Content-Length': buffer.length,
    'Content-Disposition': `attachment; filename="${encodeURIComponent(document.originalFilename)}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  return res.send(buffer);
}

export async function remove(req, res) {
  await documentService.remove(req.user.id, req.params.id);
  return success(res, null, 'Document deleted');
}
