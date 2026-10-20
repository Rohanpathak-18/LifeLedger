import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './document.controller.js';
import { uploadDocument } from './document.upload.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/', asyncHandler(controller.list));
router.post(
  '/',
  uploadDocument.single('file'),
  asyncHandler(controller.create),
);
router.get('/:id/download', asyncHandler(controller.download));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
