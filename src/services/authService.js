import api from './axiosConfig';

export const authService = {
  // Проверка инициализации Telegram WebApp
  isTelegramWebAppInitialized: () => {
    try {
      if (!window?.Telegram?.WebApp) return false;
      const webApp = window.Telegram.WebApp;
      return Boolean(webApp.initData);
    } catch (e) {
      return false;
    }
  },

  // Отправка токена в Telegram
  sendTokenToTelegram: async (token) => {
    if (!authService.isTelegramWebAppInitialized()) return false;
    try {
      const webApp = window.Telegram.WebApp;
      const data = { action: 'auth', token };
      webApp.sendData(JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Проверка токена
  verifyToken: async (token) => {
    if (!token) {
      return false;
    }

    try {
      const response = await api.post('/auth/verify-token', { token });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  // Проверка статуса админа
  checkAdminStatus: async (token) => {
    if (!token) {
      return false;
    }

    try {
      const response = await api.get('/auth/check-admin', {
        headers: { Authorization: `Shopper ${token}` }
      });
      return response.data.isAdmin;
    } catch (error) {
      return false;
    }
  },

  // Обновление токена
  refreshToken: async (token) => {
    // token optional: prefer explicit param, then stored refreshToken, then cookie
    let tokenToUse = token;
    if (!tokenToUse) {
      tokenToUse = localStorage.getItem('refreshToken') || localStorage.getItem('token') || (function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      })('refreshToken');
    }

    if (!tokenToUse) throw new Error('Токен не предоставлен');

    try {
      const response = await api.post('/auth/refresh-token', {}, {
        headers: { Authorization: `Shopper ${tokenToUse}` },
        withCredentials: true
      });
      return response.data.token;
    } catch (error) {
      throw error;
    }
  }
}; 