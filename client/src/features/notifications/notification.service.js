import api from '../../services/api.js';

export const notificationService = {
  async list() {
    const { data } = await api.get('/notifications');
    return data.data;
  },
  async markRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data.notification;
  },
  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};
