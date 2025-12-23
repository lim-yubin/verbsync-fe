import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { PlanInfo } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

export function usePlan() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<PlanInfo>({
    queryKey: QUERY_KEYS.PLAN,
    queryFn: async () => {
      const { data } = await api.get<PlanInfo>("/subscription/plan");
      return data;
    },
    enabled: isAuthenticated, // 인증된 경우에만 API 호출
    retry: false, // 인증 실패 시 재시도하지 않음
  });
}

