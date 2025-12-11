import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

// Temporary placeholder pages
function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Verbasync
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          개발자를 위한 다국어 관리 플랫폼
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition"
          >
            로그인
          </a>
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-100 dark:hover:bg-gray-700 transition"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">로그인</h2>
        <p className="text-gray-600">로그인 페이지 (작업 예정)</p>
      </div>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">회원가입</h2>
        <p className="text-gray-600">회원가입 페이지 (작업 예정)</p>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">대시보드</h2>
        <p className="text-gray-600">대시보드 페이지 (작업 예정)</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected Routes (임시) */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
