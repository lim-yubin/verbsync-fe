import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, accessToken, setAccessToken, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 인증 상태이지만 accessToken이 없는 경우 (페이지 새로고침)
      if (isAuthenticated && !accessToken) {
        try {
          // Refresh Token으로 새 Access Token 받기
          const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
          setAccessToken(data.accessToken);
        } catch (error) {
          // Refresh Token도 만료됨 → 로그아웃
          console.error("Token refresh failed:", error);
          logout();
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 앱 시작 시 한 번만 실행

  // 초기화 중에는 로딩 화면 표시
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

