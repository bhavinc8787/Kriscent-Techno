import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fb_token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  // If a dev user email is provided in env, attach x-dev-user header for backend DEV_AUTH_BYPASS
  const devUser = import.meta.env.VITE_DEV_USER_EMAIL;
  if (devUser && config.headers) config.headers['x-dev-user'] = devUser;
  return config;
});

export default api;
