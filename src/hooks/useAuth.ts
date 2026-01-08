import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  LoginDto,
  RegisterDto,
  RegisterResponse,
  AuthResponse,
  User,
  UpdateProfileDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  VerifyCodeDto,
  ResetPasswordDto,
} from "@/types/api";

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
  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const { data } = await api.post<RegisterResponse>("/auth/register", dto);
      return data;
    },
  });
}

// 이메일 인증
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (dto: VerifyEmailDto) => {
      const { data } = await api.post<{ message: string }>("/auth/verify-email", dto);
      return data;
    },
  });
}

// 이메일 인증 재발송
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async (dto: ResendVerificationDto) => {
      const { data } = await api.post<{ message: string }>("/auth/resend-verification", dto);
      return data;
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

// 프로필 수정
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      const { data } = await api.patch<User>("/auth/me", dto);
      return data;
    },
    onSuccess: (data) => {
      // 사용자 정보 갱신
      queryClient.setQueryData(QUERY_KEYS.AUTH_ME, data);
      setUser(data);
    },
  });
}

// 비밀번호 변경
export function useChangePassword() {
  return useMutation({
    mutationFn: async (dto: ChangePasswordDto) => {
      const { data } = await api.patch<{ message: string }>(
        "/auth/me/password",
        dto
      );
      return data;
    },
  });
}

// 계정 삭제
export function useDeleteAccount() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ message: string }>("/auth/me");
      return data;
    },
    onSuccess: () => {
      // 모든 쿼리 캐시 클리어
      queryClient.clear();
      // 로컬 상태 클리어
      logout();
    },
  });
}

// 비밀번호 찾기 - 이메일로 인증 코드 전송
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (dto: ForgotPasswordDto) => {
      const { data } = await api.post<{ message: string }>(
        "/auth/forgot-password",
        dto
      );
      return data;
    },
  });
}

// 비밀번호 찾기 - 인증 코드 검증
export function useVerifyCode() {
  return useMutation({
    mutationFn: async (dto: VerifyCodeDto) => {
      const { data } = await api.post<{ message: string; verified: boolean }>(
        "/auth/verify-code",
        dto
      );
      return data;
    },
  });
}

// 비밀번호 찾기 - 새 비밀번호 설정
export function useResetPassword() {
  return useMutation({
    mutationFn: async (dto: ResetPasswordDto) => {
      const { data } = await api.post<{ message: string }>(
        "/auth/reset-password",
        dto
      );
      return data;
    },
  });
}
