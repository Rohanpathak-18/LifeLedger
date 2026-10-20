import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './warranty.controller.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.patch('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
