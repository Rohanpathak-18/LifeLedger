import api from '../../../services/api.js';

export const productService = {
  async list(params = {}) {
    const { data } = await api.get('/products', { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },
  async create(product) {
    const { data } = await api.post('/products', product);
    return data.data.product;
  },
  async update(id, product) {
    const { data } = await api.patch(`/products/${id}`, product);
    return data.data.product;
  },
  async archive(id) {
    const { data } = await api.patch(`/products/${id}/archive`);
    return data.data.product;
  },
  async remove(id) {
    await api.delete(`/products/${id}`);
  },
};
