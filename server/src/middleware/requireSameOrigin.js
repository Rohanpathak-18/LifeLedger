import { env } from '../config/env.js';
import { AppError } from '../utils/responses.js';

export function requireSameOrigin(req, _res, next) {
  const origin = req.get('origin');
  if (origin && origin !== env.CLIENT_URL) {
    return next(
      new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Request origin is not allowed'),
    );
  }
  return next();
}
