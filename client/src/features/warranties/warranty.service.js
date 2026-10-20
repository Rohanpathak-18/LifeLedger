import api from '../../services/api.js';

export const warrantyService = {
  async list() {
    const { data } = await api.get('/warranties');
    return data.data.warranties;
  },
  async create(values) {
    const { data } = await api.post('/warranties', values);
    return data.data.warranty;
  },
  async update(id, values) {
    const { data } = await api.patch(`/warranties/${id}`, values);
    return data.data.warranty;
  },
  async remove(id) {
    await api.delete(`/warranties/${id}`);
  },
};
