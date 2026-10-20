import { success } from '../../utils/responses.js';
import * as notificationService from './notification.service.js';

export async function list(req, res) {
  return success(res, await notificationService.list(req.user.id));
}

export async function markRead(req, res) {
  return success(res, {
    notification: await notificationService.markRead(
      req.user.id,
      req.params.id,
    ),
  });
}

export async function markAllRead(req, res) {
  await notificationService.markAllRead(req.user.id);
  return success(res, null, 'Notifications marked as read');
}
