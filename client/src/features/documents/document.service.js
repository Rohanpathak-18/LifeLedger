import api from '../../services/api.js';

export const documentService = {
  async list() {
    const { data } = await api.get('/documents');
    return data.data.documents;
  },
  async upload({ file, type, productId, extractedText, extractedData }) {
    const body = new FormData();
    body.append('file', file);
    body.append('type', type);
    if (productId) body.append('productId', productId);
    body.append('extractedText', extractedText || '');
    body.append('extractedData', JSON.stringify(extractedData || {}));
    const { data } = await api.post('/documents', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.document;
  },
  async download(id, filename) {
    const { data } = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
  async remove(id) {
    await api.delete(`/documents/${id}`);
  },
};
