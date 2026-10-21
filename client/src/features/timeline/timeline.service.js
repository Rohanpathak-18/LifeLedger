import api from '../../services/api.js';
export const timelineService = {
  async list() {
    const { data } = await api.get('/timeline');
    return data.data.items;
  },
};
