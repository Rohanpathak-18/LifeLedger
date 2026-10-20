import multer from 'multer';
import { AppError } from '../../utils/responses.js';

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return callback(
        new AppError(
          400,
          'UNSUPPORTED_FILE',
          'Upload a JPEG, PNG, or PDF file',
        ),
      );
    }
    return callback(null, true);
  },
});

export function verifiedType(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return 'image/jpeg';
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png';
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  return null;
}
