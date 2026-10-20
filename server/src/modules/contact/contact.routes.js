import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { requireSameOrigin } from '../../middleware/requireSameOrigin.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './contact.controller.js';

const router = Router();
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post(
  '/',
  contactLimiter,
  requireSameOrigin,
  requireDatabase,
  asyncHandler(controller.create),
);

export default router;
