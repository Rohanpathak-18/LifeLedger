import { success } from '../../utils/responses.js';
import {
  maintenanceSchema,
  maintenanceUpdateSchema,
  repairSchema,
} from './care.validation.js';
import * as careService from './care.service.js';

export async function listRepairs(req, res) {
  return success(res, { repairs: await careService.listRepairs(req.user.id) });
}
export async function createRepair(req, res) {
  return success(
    res,
    {
      repair: await careService.createRepair(
        req.user.id,
        repairSchema.parse(req.body),
      ),
    },
    'Repair saved',
  );
}
export async function updateRepair(req, res) {
  return success(
    res,
    {
      repair: await careService.updateRepair(
        req.user.id,
        req.params.id,
        repairSchema.omit({ productId: true }).partial().parse(req.body),
      ),
    },
    'Repair updated',
  );
}
export async function removeRepair(req, res) {
  await careService.removeRepair(req.user.id, req.params.id);
  return success(res, null, 'Repair deleted');
}
export async function listMaintenance(req, res) {
  return success(res, {
    tasks: await careService.listMaintenance(req.user.id),
  });
}
export async function createMaintenance(req, res) {
  return success(
    res,
    {
      task: await careService.createMaintenance(
        req.user.id,
        maintenanceSchema.parse(req.body),
      ),
    },
    'Maintenance task saved',
  );
}
export async function updateMaintenance(req, res) {
  return success(
    res,
    {
      task: await careService.updateMaintenance(
        req.user.id,
        req.params.id,
        maintenanceUpdateSchema.parse(req.body),
      ),
    },
    'Maintenance task updated',
  );
}
export async function removeMaintenance(req, res) {
  await careService.removeMaintenance(req.user.id, req.params.id);
  return success(res, null, 'Maintenance task deleted');
}
