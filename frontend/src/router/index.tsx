import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/Landing/LandingPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { StudentsPage, StudentDetailPage } from '../pages/Students/StudentsPage';
import { TeachersPage } from '../pages/Teachers/TeachersPage';
import { CoursesPage } from '../pages/Courses/CoursesPage';
import { CourseDetailPage } from '../pages/Courses/CourseDetailPage';
import { CategoriesPage } from '../pages/Categories/CategoriesPage';
import { AssignmentsPage } from '../pages/Assignments/AssignmentsPage';
import { PaymentsPage } from '../pages/Payments/PaymentsPage';
import { AnalyticsPage } from '../pages/Analytics/AnalyticsPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { MessagesPage } from '../pages/Messages/MessagesPage';
import { useAuthStore } from '../store/authStore';
import { configureEmbed } from '../embed/runtime';

const BASE = '/education/app';

configureEmbed({
  basePath: BASE,
  mode: 'standalone',
  hideLogout: false,
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
});

function PublicOnly({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter basename={BASE}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:id" element={<MessagesPage />} />
            <Route element={<ProtectedRoute roles={['ADMIN', 'TEACHER']} />}>
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route element={<ProtectedRoute roles={['ADMIN', 'STUDENT']} />}>
              <Route path="payments" element={<PaymentsPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['ADMIN', 'TEACHER']} />}>
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
