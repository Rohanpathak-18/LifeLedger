import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './dashboard.controller.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/summary', asyncHandler(controller.summary));

export default router;
