import { success } from '../../utils/responses.js';
import * as dashboardService from './dashboard.service.js';

export async function summary(req, res) {
  return success(res, await dashboardService.getSummary(req.user.id));
}
