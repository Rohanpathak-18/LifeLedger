import mongoose from 'mongoose';
import { AppError } from '../utils/responses.js';

export function requireDatabase(_req, _res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(
      new AppError(
        503,
        'DATABASE_UNAVAILABLE',
        'Database unavailable. Start MongoDB and configure server/.env before creating an account.',
      ),
    );
  }

  return next();
}

export function requireDatabaseForRefresh(req, res, next) {
  if (req.cookies.ll_refresh && mongoose.connection.readyState !== 1) {
    return requireDatabase(req, res, next);
  }

  return next();
}
