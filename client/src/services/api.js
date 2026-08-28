import axios from 'axios';

// Get API base URL from environment or default to local backend
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

// Response Interceptor: Handle 401 & 403 Unauthorized / Deactivated accounts globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.data?.isDeactivated) {
        const msg =
          error.response.data.message ||
          'Your account has been deactivated by an administrator. Please contact your platform administrator for assistance.';
        sessionStorage.setItem('deactivationNotice', msg);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:deactivated', { detail: msg }));
        }
      } else if (error.response.status === 401) {
        // Clear expired / invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
// Assessment & Quiz APIs
// ==========================================
export const getModuleQuizApi = async (moduleId) => {
  const response = await api.get(`/modules/${moduleId}/quiz`);
  return response.data;
};

export const saveModuleQuizApi = async (moduleId, quizData) => {
  const response = await api.post(`/modules/${moduleId}/quiz`, quizData);
  return response.data;
};

export const getFinalAssessmentApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/final-assessment`);
  return response.data;
};

export const saveFinalAssessmentApi = async (courseId, assessmentData) => {
  const response = await api.post(`/courses/${courseId}/final-assessment`, assessmentData);
  return response.data;
};

export const deleteAssessmentApi = async (assessmentId) => {
  const response = await api.delete(`/assessments/${assessmentId}`);
  return response.data;
};

export const toggleAssessmentStatusApi = async (assessmentId) => {
  const response = await api.put(`/assessments/${assessmentId}/status`);
  return response.data;
};

export const submitAssessmentAttemptApi = async (assessmentId, attemptData) => {
  const response = await api.post(`/assessments/${assessmentId}/attempt`, attemptData);
  return response.data;
};

export const getMyAssessmentAttemptsApi = async (assessmentId) => {
  const response = await api.get(`/assessments/${assessmentId}/my-attempts`);
  return response.data;
};

export const getCourseAssessmentResultsApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/trainer-results`);
  return response.data;
};

export const getMyAssessmentsFeedApi = async () => {
  const response = await api.get('/assessments/my-feed');
  return response.data;
};

export const getTrainerAssessmentsOverviewApi = async () => {
  const response = await api.get('/assessments/trainer-overview');
  return response.data;
};

export const getAssessmentByIdApi = async (assessmentId) => {
  const response = await api.get(`/assessments/${assessmentId}`);
  return response.data;
};

// ==========================================
// Certificate APIs
// ==========================================
export const getMyCertificatesApi = async () => {
  const response = await api.get('/certificates/my');
  return response.data;
};

export const getCertificateByIdApi = async (certificateId) => {
  const response = await api.get(`/certificates/${certificateId}`);
  return response.data;
};

export const downloadCertificateApi = async (certificateId) => {
  const response = await api.get(`/certificates/${certificateId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// ==========================================
// Skill Management APIs
// ==========================================
export const getSkillsApi = async (params = {}) => {
  const response = await api.get('/skills', { params });
  return response.data;
};

export const getSkillByIdApi = async (skillId) => {
  const response = await api.get(`/skills/${skillId}`);
  return response.data;
};

export const createSkillApi = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const updateSkillApi = async (skillId, skillData) => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

export const toggleSkillStatusApi = async (skillId) => {
  const response = await api.patch(`/skills/${skillId}/status`);
  return response.data;
};

export const deleteSkillApi = async (skillId) => {
  const response = await api.delete(`/skills/${skillId}`);
  return response.data;
};

// ==========================================
// Competency Management APIs
// ==========================================
export const getCompetenciesApi = async (params = {}) => {
  const response = await api.get('/competencies', { params });
  return response.data;
};

export const getCompetencyByIdApi = async (competencyId) => {
  const response = await api.get(`/competencies/${competencyId}`);
  return response.data;
};

export const createCompetencyApi = async (competencyData) => {
  const response = await api.post('/competencies', competencyData);
  return response.data;
};

export const updateCompetencyApi = async (competencyId, competencyData) => {
  const response = await api.put(`/competencies/${competencyId}`, competencyData);
  return response.data;
};

export const toggleCompetencyStatusApi = async (competencyId) => {
  const response = await api.patch(`/competencies/${competencyId}/status`);
  return response.data;
};

export const deleteCompetencyApi = async (competencyId) => {
  const response = await api.delete(`/competencies/${competencyId}`);
  return response.data;
};

// ==========================================
// Trainee Skill Profile & Competencies APIs
// ==========================================
export const getMySkillsProfileApi = async () => {
  const response = await api.get('/trainees/me/skills');
  return response.data;
};

export const getMyCompetenciesOverviewApi = async () => {
  const response = await api.get('/trainees/me/competencies');
  return response.data;
};

// ==========================================
// Analytics & Performance Insights APIs (Phase 6)
// ==========================================
export const getTraineeAnalyticsApi = async () => {
  const response = await api.get('/analytics/trainee');
  return response.data;
};

export const getTrainerAnalyticsApi = async () => {
  const response = await api.get('/analytics/trainer');
  return response.data;
};

export const getAdminAnalyticsApi = async () => {
  const response = await api.get('/analytics/admin');
  return response.data;
};

// ==========================================
// User & Trainer Management APIs (Phase 6.5)
// ==========================================
export const getAllUsersApi = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserByIdApi = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const toggleUserStatusApi = async (userId, isActive) => {
  const response = await api.patch(`/users/${userId}/status`, { isActive });
  return response.data;
};

export const getTrainersApi = async () => {
  const response = await api.get('/trainers');
  return response.data;
};

export const getTrainerByIdApi = async (trainerId) => {
  const response = await api.get(`/trainers/${trainerId}`);
  return response.data;
};

export const getTrainerLearnersApi = async () => {
  const response = await api.get('/trainer/learners');
  return response.data;
};

export const getTrainerLearnerDetailsApi = async (learnerId) => {
  const response = await api.get(`/trainer/learners/${learnerId}`);
  return response.data;
};

export const getAssessmentAttemptReviewApi = async (attemptId) => {
  const response = await api.get(`/assessments/attempts/${attemptId}/review`);
  return response.data;
};

export const explainAssessmentQuestionApi = async (attemptId, questionId) => {
  const response = await api.post(`/assessments/attempts/${attemptId}/questions/${questionId}/explain`);
  return response.data;
};

export const getAiCourseRecommendationsApi = async (params = {}) => {
  const response = await api.get('/ai/recommendations', { params });
  return response.data;
};

export const refreshAiCourseRecommendationsApi = async () => {
  const response = await api.post('/ai/recommendations/refresh');
  return response.data;
};

export const getSkillAiGuidanceApi = async (skillName) => {
  const response = await api.get(`/ai/skills/${encodeURIComponent(skillName)}/guidance`);
  return response.data;
};

export const getCourseAiRationaleApi = async (courseId) => {
  const response = await api.get(`/ai/courses/${courseId}/rationale`);
  return response.data;
};

export const getAiLearningPathApi = async (params = {}) => {
  const response = await api.get('/ai/learning-path', { params });
  return response.data;
};

export const refreshAiLearningPathApi = async () => {
  const response = await api.post('/ai/learning-path/refresh');
  return response.data;
};

// ==========================================
// AI Career Goal & Learning Roadmap APIs (Phase 7.4.1)
// ==========================================
export const getAiCareerGoalApi = async () => {
  const response = await api.get('/ai/career-goal');
  return response.data;
};

export const setAiCareerGoalApi = async (careerGoal) => {
  const response = await api.post('/ai/career-goal', { careerGoal });
  return response.data;
};

export const getAiCareerRoadmapApi = async (params = {}) => {
  const response = await api.get('/ai/career-roadmap', { params });
  return response.data;
};

export const refreshAiCareerRoadmapApi = async (careerGoal) => {
  const response = await api.post('/ai/career-roadmap/refresh', { careerGoal });
  return response.data;
};

// ==========================================
// Adaptive AI Learning Advisor APIs (Phase 7.5)
// ==========================================
export const getAiAdaptiveAdvisorApi = async (params = {}) => {
  const response = await api.get('/ai/adaptive-advisor', { params });
  return response.data;
};

export const refreshAiAdaptiveAdvisorApi = async () => {
  const response = await api.post('/ai/adaptive-advisor/refresh');
  return response.data;
};

// ==========================================
// Contextual AI Course Doubts Chatbot API
// ==========================================
export const askCourseDoubtApi = async (courseId, message, history = []) => {
  const response = await api.post(`/ai/courses/${courseId}/doubt-assistant`, {
    message,
    history,
  });
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

