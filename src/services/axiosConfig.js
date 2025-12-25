import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://opium-2-igrl.onrender.com/api',
  withCredentials: true
});

// Attach access token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    try {
      // debug: lightweight log (do not print full token)
      console.debug('api: attaching auth header for request to', config.url, 'tokenPresent=true');
    } catch (e) {
      // ignore
    }
  }
  return config;
});

// Handle 401 by trying to refresh token once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const currentAccess = localStorage.getItem('token');
        const newToken = await authService.refreshToken(currentAccess);
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          console.debug('api: refreshed token and retrying', originalRequest.url);
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.debug('api: refresh token failed for', originalRequest.url, refreshError?.message || refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // debug single 401
    if (error.response?.status === 401) {
      try { console.debug('api: request 401', originalRequest?.url || originalRequest); } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default api;