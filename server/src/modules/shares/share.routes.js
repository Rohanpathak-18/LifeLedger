import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import { AppError } from '../../utils/responses.js';
import * as controller from './share.controller.js';
const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
router.get('/emergency', asyncHandler(controller.readEmergency));
router.put(
  '/emergency',
  (req, _res, next) => {
    const parsed = z
      .object({ information: z.string().max(10000) })
      .safeParse(req.body);
    if (!parsed.success)
      return next(
        new AppError(
          400,
          'INVALID_INPUT',
          'Emergency information must be under 10,000 characters',
        ),
      );
    req.body = parsed.data;
    next();
  },
  asyncHandler(controller.saveEmergency),
);
router.post(
  '/',
  (req, _res, next) => {
    const parsed = z
      .object({
        productId: z.string(),
        email: z.string().email().max(254),
        role: z.enum(['editor', 'viewer']),
      })
      .safeParse(req.body);
    if (!parsed.success)
      return next(
        new AppError(
          400,
          'INVALID_INPUT',
          'Enter a valid email, item, and permission level',
        ),
      );
    req.body = parsed.data;
    next();
  },
  asyncHandler(controller.create),
);
router.delete('/:id', asyncHandler(controller.revoke));
export default router;
