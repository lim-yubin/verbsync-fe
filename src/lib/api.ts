import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: JWT 자동 주입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("verbasync-auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 → 로그아웃
      localStorage.removeItem("verbasync-auth-token");
      localStorage.removeItem("verbasync-auth-user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

