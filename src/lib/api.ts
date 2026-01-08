import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import i18n from "@/lib/i18n";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ 쿠키 자동 전송 (Refresh Token)
});

// Request Interceptor: Access Token 자동 주입 + Accept-Language 헤더 추가
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 현재 선택된 언어를 Accept-Language 헤더로 전달
  // 백엔드가 이 헤더를 읽어서 해당 언어로 응답 메시지를 반환할 수 있음
  const currentLanguage = i18n.language || "ko";
  config.headers["Accept-Language"] = currentLanguage;

  return config;
});

// Response Interceptor: 자동 토큰 갱신 및 에러 처리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (
  error: AxiosError<unknown> | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 && 재시도 아님 && 인증 엔드포인트 아님 && 인증 불필요 엔드포인트 아님
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/members/invite/") // 초대 정보 조회는 인증 불필요
    ) {
      if (isRefreshing) {
        // 다른 요청이 이미 토큰 갱신 중이면 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Token으로 새 Access Token 받기
        const { data } = await api.post("/auth/refresh");
        const { accessToken } = data;

        // 새 Access Token 저장
        useAuthStore.getState().setAccessToken(accessToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료됨 → 로그아웃
        const axiosError = refreshError as AxiosError<unknown>;
        processQueue(axiosError, null);
        useAuthStore.getState().logout();
        
        // 초대 수락 페이지에서는 리다이렉트하지 않음 (사용자가 초대 정보를 볼 수 있어야 함)
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/accept-invite")) {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
