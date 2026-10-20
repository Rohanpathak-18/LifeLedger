import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
}

export function errorHandler(error, _req, res, _next) {
  void _next;
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'The upload limit is 10 MB' },
    });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'The request body is not valid JSON',
      },
    });
  }
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The supplied data is invalid',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message:
        status >= 500 && env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
    },
  });
}
