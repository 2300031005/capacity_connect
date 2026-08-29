import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Trainee Workspace Pages
import TraineeDashboardPage from './pages/TraineeDashboardPage';
import TraineeProfilePage from './pages/trainee/TraineeProfilePage';
import CourseCatalogPage from './pages/trainee/CourseCatalogPage';
import CourseDetailsPage from './pages/trainee/CourseDetailsPage';
import MyCoursesPage from './pages/trainee/MyCoursesPage';
import TraineeAssessmentsPage from './pages/trainee/TraineeAssessmentsPage';
import TraineeSkillsPage from './pages/trainee/TraineeSkillsPage';
import TraineeCompetenciesPage from './pages/trainee/TraineeCompetenciesPage';
import TraineeAnalyticsPage from './pages/trainee/TraineeAnalyticsPage';
import TraineeRecommendationsPage from './pages/trainee/TraineeRecommendationsPage';

// Trainer Workspace Pages
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import TrainerProfilePage from './pages/trainer/TrainerProfilePage';
import TrainerCoursesPage from './pages/trainer/TrainerCoursesPage';
import CreateCoursePage from './pages/trainer/CreateCoursePage';
import ManageCoursePage from './pages/trainer/ManageCoursePage';
import TrainerLearnersPage from './pages/trainer/TrainerLearnersPage';
import TrainerAssessmentsPage from './pages/trainer/TrainerAssessmentsPage';
import TrainerAnalyticsPage from './pages/trainer/TrainerAnalyticsPage';

// Admin Workspace Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTrainersPage from './pages/admin/AdminTrainersPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminCompetenciesPage from './pages/admin/AdminCompetenciesPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
        {/* Public Portal Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Role-Protected Trainee Workspace */}
        <Route
          path="/trainee"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TraineeDashboardPage />} />
          <Route path="profile" element={<TraineeProfilePage />} />
          <Route path="recommendations" element={<TraineeRecommendationsPage />} />
          <Route path="courses" element={<CourseCatalogPage />} />
          <Route path="courses/:id" element={<CourseDetailsPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="assessments" element={<TraineeAssessmentsPage />} />
          <Route path="skills" element={<TraineeSkillsPage />} />
          <Route path="competencies" element={<TraineeCompetenciesPage />} />
          <Route path="analytics" element={<TraineeAnalyticsPage />} />
        </Route>

        {/* Role-Protected Trainer Workspace */}
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TrainerDashboardPage />} />
          <Route path="profile" element={<TrainerProfilePage />} />
          <Route path="courses" element={<TrainerCoursesPage />} />
          <Route path="courses/create" element={<CreateCoursePage />} />
          <Route path="courses/:id/manage" element={<ManageCoursePage />} />
          <Route path="learners" element={<TrainerLearnersPage />} />
          <Route path="assessments" element={<TrainerAssessmentsPage />} />
          <Route path="analytics" element={<TrainerAnalyticsPage />} />
        </Route>

        {/* Role-Protected Admin Workspace */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="trainers" element={<AdminTrainersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="competencies" element={<AdminCompetenciesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
