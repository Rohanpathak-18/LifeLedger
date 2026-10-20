import api from '../../services/api.js';

export const contactService = {
  async send(values) {
    const { data } = await api.post('/contact', values);
    return data.data;
  },
};
