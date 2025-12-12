import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { QUERY_KEYS } from "@/lib/constants";
import type { LoginDto, RegisterDto, AuthResponse, User } from "@/types/api";

// 로그인
export function useLogin() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { data } = await api.post<AuthResponse>("/auth/login", dto);
      return data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}

// 회원가입
export function useRegister() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const { data } = await api.post<AuthResponse>("/auth/register", dto);
      return data;
    },
    onSuccess: (data) => {
      // 회원가입 성공 시 자동 로그인
      login(data.accessToken, data.user);
    },
  });
}

// 현재 사용자 정보 조회
export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
    enabled: isAuthenticated,
  });
}

// 로그아웃
export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      // 성공/실패 상관없이 로컬 상태 클리어
      logout();
    },
  });
}
