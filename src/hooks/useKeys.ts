import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface Key {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateKeyDto {
  name: string;
  description?: string;
}

// 번역 키 목록 조회
export function useKeys(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.KEYS(projectId),
    queryFn: async () => {
      const { data } = await api.get<Key[]>(`/projects/${projectId}/keys`);
      return data;
    },
    enabled: !!projectId,
  });
}

// 번역 키 추가
export function useCreateKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateKeyDto) => {
      const { data } = await api.post<Key>(`/projects/${projectId}/keys`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.KEYS(projectId),
      });
    },
  });
}

