import axios from 'axios';

const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || '')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

// Create Axios instance with base configuration and fast 1s timeout
const api = axios.create({
  baseURL: configuredBaseURL || '/',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach auth header automatically
api.interceptors.request.use(
  (config) => {
    const token = 
      localStorage.getItem('token') || 
      localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
    const isDemoToken = localStorage.getItem('token')?.startsWith('demo-token-');

    if (error.response && error.response.status === 401 && !isLoginEndpoint && !isDemoToken) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
