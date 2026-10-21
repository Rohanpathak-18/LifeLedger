import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireSameOrigin } from '../../middleware/requireSameOrigin.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  requireDatabase,
  requireDatabaseForRefresh,
} from '../../middleware/requireDatabase.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Try again shortly.',
    },
  },
});

router.post(
  '/register',
  authLimiter,
  requireSameOrigin,
  requireDatabase,
  asyncHandler(authController.register),
);
router.post(
  '/login',
  authLimiter,
  requireSameOrigin,
  requireDatabase,
  asyncHandler(authController.login),
);
router.post(
  '/session',
  requireSameOrigin,
  requireDatabaseForRefresh,
  asyncHandler(authController.restoreSession),
);
router.post(
  '/refresh',
  requireSameOrigin,
  requireDatabaseForRefresh,
  asyncHandler(authController.refresh),
);
router.post(
  '/logout',
  requireSameOrigin,
  requireDatabaseForRefresh,
  asyncHandler(authController.logout),
);
router.get(
  '/me',
  requireDatabase,
  requireAuth,
  asyncHandler(authController.me),
);
router.patch(
  '/profile',
  requireSameOrigin,
  requireDatabase,
  requireAuth,
  asyncHandler(authController.updateProfile),
);

export default router;
