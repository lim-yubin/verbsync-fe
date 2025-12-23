import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { PlanInfo } from "@/types/api";

export function usePlan() {
  return useQuery<PlanInfo>({
    queryKey: QUERY_KEYS.PLAN,
    queryFn: async () => {
      const { data } = await api.get<PlanInfo>("/subscription/plan");
      return data;
    },
  });
}

