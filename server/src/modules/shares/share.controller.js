import * as service from './share.service.js';
import { success } from '../../utils/responses.js';
import * as emergency from './emergency.service.js';
export async function list(req, res) {
  return success(res, await service.list(req.user.id));
}
export async function create(req, res) {
  return success(res, { grant: await service.create(req.user.id, req.body) });
}
export async function revoke(req, res) {
  await service.revoke(req.user.id, req.params.id);
  return success(res, {});
}
export async function readEmergency(req, res) {
  return success(res, await emergency.read(req.user.id));
}
export async function saveEmergency(req, res) {
  return success(res, await emergency.write(req.user.id, req.body.information));
}
