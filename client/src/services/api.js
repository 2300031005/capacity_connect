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

// Centralized Health Check API service
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
