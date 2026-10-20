import api, { setAccessToken } from '../../services/api.js';

let restoreRequest;

export const authService = {
  async register(details) {
    const { data } = await api.post('/auth/register', details);
    setAccessToken(data.data.accessToken);
    return data.data;
  },
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.data.accessToken);
    return data.data;
  },
  async refresh() {
    const { data } = await api.post('/auth/refresh');
    setAccessToken(data.data.accessToken);
    return data.data;
  },
  restoreSession() {
    restoreRequest ||= api
      .post('/auth/session')
      .then(({ data }) => {
        if (data.data.authenticated) setAccessToken(data.data.accessToken);
        return data.data;
      })
      .finally(() => {
        restoreRequest = undefined;
      });
    return restoreRequest;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
};
