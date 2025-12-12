import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/constants";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * 공개 페이지 보호 (로그인 상태에서 접근 시 대시보드로 리다이렉트)
 * 예: 로그인 페이지, 회원가입 페이지, 랜딩 페이지
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

