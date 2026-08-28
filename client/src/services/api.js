import axios from 'axios';

// Get API base URL from environment or default to local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Create configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ==========================================
// Course APIs
// ==========================================
export const getCoursesApi = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data;
};

export const getCourseByIdApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const createCourseApi = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const updateCourseApi = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export const publishCourseApi = async (courseId, status) => {
  const response = await api.patch(`/courses/${courseId}/publish`, { status });
  return response.data;
};

export const deleteCourseApi = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// ==========================================
// Module APIs
// ==========================================
export const createModuleApi = async (courseId, moduleData) => {
  const response = await api.post(`/courses/${courseId}/modules`, moduleData);
  return response.data;
};

export const getModulesApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/modules`);
  return response.data;
};

export const updateModuleApi = async (moduleId, moduleData) => {
  const response = await api.put(`/modules/${moduleId}`, moduleData);
  return response.data;
};

export const deleteModuleApi = async (moduleId) => {
  const response = await api.delete(`/modules/${moduleId}`);
  return response.data;
};

export const updateModuleOrderApi = async (moduleId, order) => {
  const response = await api.patch(`/modules/${moduleId}/order`, { order });
  return response.data;
};

// ==========================================
// Resource APIs
// ==========================================
export const createResourceApi = async (moduleId, formDataOrJson, isMultipart = false) => {
  const response = await api.post(`/modules/${moduleId}/resources`, formDataOrJson, {
    headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const deleteResourceApi = async (resourceId) => {
  const response = await api.delete(`/resources/${resourceId}`);
  return response.data;
};

// ==========================================
// Enrollment APIs
// ==========================================
export const enrollCourseApi = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};

export const getMyCoursesApi = async () => {
  const response = await api.get('/enrollments/my-courses');
  return response.data;
};

export const getEnrollmentStatusApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/enrollment`);
  return response.data;
};

export const toggleModuleCompleteApi = async (courseId, moduleId) => {
  const response = await api.put(`/courses/${courseId}/modules/${moduleId}/toggle-complete`);
  return response.data;
};

// ==========================================
// Course Review APIs
// ==========================================
export const getCourseReviewsApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/reviews`);
  return response.data;
};

export const createCourseReviewApi = async (courseId, reviewData) => {
  const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
  return response.data;
};

export const updateCourseReviewApi = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteCourseReviewApi = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// ==========================================
// Course Discussion APIs
// ==========================================
export const getCourseDiscussionsApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/discussions`);
  return response.data;
};

export const createCourseDiscussionMessageApi = async (courseId, messageData) => {
  const response = await api.post(`/courses/${courseId}/discussions`, messageData);
  return response.data;
};

// ==========================================
// Trainer Learners Inspection APIs
// ==========================================
export const getCourseLearnersApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/learners`);
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

