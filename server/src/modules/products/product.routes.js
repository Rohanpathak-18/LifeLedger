import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './product.controller.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.get));
router.patch('/:id', asyncHandler(controller.update));
router.patch('/:id/archive', asyncHandler(controller.archive));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
