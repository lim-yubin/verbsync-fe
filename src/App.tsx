import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectDetailPage,
  LocalesPage,
  TranslationsPage,
  ProjectSettingsPage,
  MembersPage,
  SettingsPage,
  SubscriptionPage,
  AcceptInvitePage,
  PrivacyPage,
  TermsPage,
  RefundPage,
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
              <LoginPage />
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
        <Route
          path={ROUTES.ACCEPT_INVITE}
          element={<AcceptInvitePage />}
        />
        <Route
          path={ROUTES.TERMS}
          element={<TermsPage />}
        />
        <Route
          path={ROUTES.PRIVACY}
          element={<PrivacyPage />}
        />
        <Route
          path={ROUTES.REFUND}
          element={<RefundPage />}
        />
        <Route
          path={ROUTES.SUBSCRIPTION}
          element={<SubscriptionPage />}
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
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <SettingsPage />
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
          path="/projects/:id/translations"
          element={
            <ProtectedRoute>
              <TranslationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/settings"
          element={
            <ProtectedRoute>
              <ProjectSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MEMBERS}
          element={
            <ProtectedRoute>
              <MembersPage />
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
