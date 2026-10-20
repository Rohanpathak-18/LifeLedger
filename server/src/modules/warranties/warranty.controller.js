import { success } from '../../utils/responses.js';
import { warrantySchema, warrantyUpdateSchema } from './warranty.validation.js';
import * as warrantyService from './warranty.service.js';

export async function list(req, res) {
  return success(res, { warranties: await warrantyService.list(req.user.id) });
}

export async function create(req, res) {
  const warranty = await warrantyService.create(
    req.user.id,
    warrantySchema.parse(req.body),
  );
  return success(res, { warranty }, 'Warranty created');
}

export async function update(req, res) {
  const warranty = await warrantyService.update(
    req.user.id,
    req.params.id,
    warrantyUpdateSchema.parse(req.body),
  );
  return success(res, { warranty }, 'Warranty updated');
}

export async function remove(req, res) {
  await warrantyService.remove(req.user.id, req.params.id);
  return success(res, null, 'Warranty deleted');
}
