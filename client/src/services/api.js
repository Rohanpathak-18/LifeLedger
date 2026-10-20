import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let refreshRequest;

export function setAccessToken(token) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthRequest = /^\/auth\/(login|register|refresh|logout)/.test(
      request?.url || '',
    );

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retried ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      refreshRequest ||= api.post('/auth/refresh').finally(() => {
        refreshRequest = undefined;
      });
      const { data } = await refreshRequest;
      setAccessToken(data.data.accessToken);
      request.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
