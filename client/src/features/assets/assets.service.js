import api from '../../services/api.js';
export const assetsService = {
  async summary() {
    const { data } = await api.get('/assets');
    return data.data;
  },
  async exportCsv() {
    const { data } = await api.get('/assets/export', { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lifeledger-inventory.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
