import * as service from './timeline.service.js';
import { success } from '../../utils/responses.js';

export async function list(req, res) {
  return success(res, { items: await service.list(req.user.id) });
}
