import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './notification.controller.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
router.patch('/read-all', asyncHandler(controller.markAllRead));
router.patch('/:id/read', asyncHandler(controller.markRead));

export default router;
