import axios from 'axios';

// Get API base URL from environment or default to local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired / invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================

/**
 * Register a new Trainee or Trainer account
 * @param {Object} userData - { name, email, password, role, department }
 */
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user and receive JWT token
 * @param {Object} credentials - { email, password }
 */
export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current authenticated user session profile
 */
export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ==========================================
// Health Check API
// ==========================================
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
