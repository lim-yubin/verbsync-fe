import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectDetailPage,
  LocalesPage,
  KeysPage,
} from "@/pages";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (로그인 시 대시보드로 리다이렉트) */}
        <Route
          path={ROUTES.HOME}
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes (비로그인 시 로그인 페이지로 리다이렉트) */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/locales"
          element={
            <ProtectedRoute>
              <LocalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/keys"
          element={
            <ProtectedRoute>
              <KeysPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
