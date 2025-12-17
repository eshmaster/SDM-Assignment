import axios from 'axios';

const fallbackBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

const api = axios.create({
  baseURL: fallbackBaseUrl,
  timeout: 10000, // 10s default timeout to surface slow requests quickly
});

// Attach a timestamp and log outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // add metadata for timing
  config.metadata = { startTime: Date.now() };
  console.debug(`API → ${config.method?.toUpperCase() || 'METHOD'} ${config.url}`, { url: config.url, method: config.method, data: config.data });
  return config;
});

// Log responses with timing, and surface timeout info in errors
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const duration = config?.metadata ? Date.now() - config.metadata.startTime : undefined;
    console.debug(`API ← ${config.method?.toUpperCase() || 'METHOD'} ${config.url} ${response.status}` + (duration ? ` (${duration}ms)` : ''), { status: response.status, duration });
    return response;
  },
  (error) => {
    const config = error.config || {};
    const duration = config?.metadata ? Date.now() - config.metadata.startTime : undefined;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');

    if (isTimeout) {
      console.warn(`API Timeout: ${config.method?.toUpperCase() || 'METHOD'} ${config.url}` + (duration ? ` (${duration}ms)` : ''), { code: error.code, message: error.message });
    } else {
      console.error(`API Error: ${config.method?.toUpperCase() || 'METHOD'} ${config.url}` + (duration ? ` (${duration}ms)` : ''), { code: error.code, message: error.message });
    }

    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
