import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './timeline.controller.js';
const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
export default router;
