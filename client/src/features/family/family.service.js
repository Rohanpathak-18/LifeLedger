import api from '../../services/api.js';
export const familyService = {
  async list() {
    const { data } = await api.get('/shares');
    return data.data;
  },
  async share(input) {
    const { data } = await api.post('/shares', input);
    return data.data.grant;
  },
  async revoke(id) {
    await api.delete(`/shares/${id}`);
  },
  async readEmergency() {
    const { data } = await api.get('/shares/emergency');
    return data.data;
  },
  async saveEmergency(information) {
    const { data } = await api.put('/shares/emergency', { information });
    return data.data;
  },
};
