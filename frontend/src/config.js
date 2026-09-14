// Centralized API configuration
let envUrl = import.meta.env.VITE_API_URL;

if (envUrl) {
  envUrl = envUrl.trim();
  if (!envUrl.endsWith('/api') && !envUrl.endsWith('/api/')) {
    envUrl = envUrl.replace(/\/+$/, '') + '/api';
  }
}

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE = (isLocalhost && (!envUrl || envUrl.includes('onrender.com')))
  ? 'http://localhost:5000/api'
  : (envUrl || 'http://localhost:5000/api');

