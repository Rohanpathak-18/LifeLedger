import api from '../../services/api.js';

export const careService = {
  async listRepairs() {
    const { data } = await api.get('/care/repairs');
    return data.data.repairs;
  },
  async createRepair(values) {
    const { data } = await api.post('/care/repairs', values);
    return data.data.repair;
  },
  async removeRepair(id) {
    await api.delete(`/care/repairs/${id}`);
  },
  async listMaintenance() {
    const { data } = await api.get('/care/maintenance');
    return data.data.tasks;
  },
  async createMaintenance(values) {
    const { data } = await api.post('/care/maintenance', values);
    return data.data.task;
  },
  async updateMaintenance(id, values) {
    const { data } = await api.patch(`/care/maintenance/${id}`, values);
    return data.data.task;
  },
  async removeMaintenance(id) {
    await api.delete(`/care/maintenance/${id}`);
  },
};
