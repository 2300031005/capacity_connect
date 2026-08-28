import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import CourseCatalogPage from './pages/trainee/CourseCatalogPage';
import CourseDetailsPage from './pages/trainee/CourseDetailsPage';
import MyCoursesPage from './pages/trainee/MyCoursesPage';
import TraineeAssessmentsPage from './pages/trainee/TraineeAssessmentsPage';

// Trainer Workspace Pages
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import TrainerCoursesPage from './pages/trainer/TrainerCoursesPage';
import CreateCoursePage from './pages/trainer/CreateCoursePage';
import ManageCoursePage from './pages/trainer/ManageCoursePage';
import TrainerAssessmentsPage from './pages/trainer/TrainerAssessmentsPage';

// Admin Workspace Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';

function App() {
  return (
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
          <Route path="courses" element={<CourseCatalogPage />} />
          <Route path="courses/:id" element={<CourseDetailsPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="assessments" element={<TraineeAssessmentsPage />} />
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
          <Route path="courses" element={<TrainerCoursesPage />} />
          <Route path="courses/create" element={<CreateCoursePage />} />
          <Route path="courses/:id/manage" element={<ManageCoursePage />} />
          <Route path="assessments" element={<TrainerAssessmentsPage />} />
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
          <Route path="courses" element={<AdminCoursesPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
