import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireDatabase } from '../../middleware/requireDatabase.js';
import * as controller from './care.controller.js';

const router = Router();
router.use(requireDatabase, requireAuth);
router.get('/repairs', asyncHandler(controller.listRepairs));
router.post('/repairs', asyncHandler(controller.createRepair));
router.patch('/repairs/:id', asyncHandler(controller.updateRepair));
router.delete('/repairs/:id', asyncHandler(controller.removeRepair));
router.get('/maintenance', asyncHandler(controller.listMaintenance));
router.post('/maintenance', asyncHandler(controller.createMaintenance));
router.patch('/maintenance/:id', asyncHandler(controller.updateMaintenance));
router.delete('/maintenance/:id', asyncHandler(controller.removeMaintenance));

export default router;
