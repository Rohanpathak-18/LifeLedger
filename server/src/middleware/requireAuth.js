import { authenticate } from '../modules/auth/auth.service.js';

export async function requireAuth(req, _res, next) {
  try {
    req.user = await authenticate(req.headers.authorization);
    next();
  } catch (error) {
    next(error);
  }
}
