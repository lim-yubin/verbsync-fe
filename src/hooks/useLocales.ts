import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface Locale {
  id: string;
  projectId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateLocaleDto {
  code: string;
  name: string;
}

interface UpdateLocaleStatusDto {
  isActive: boolean;
}

// 언어 목록 조회
export function useLocales(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LOCALES(projectId),
    queryFn: async () => {
      const { data } = await api.get<Locale[]>(`/projects/${projectId}/locales`);
      return data;
    },
    enabled: !!projectId,
  });
}

// 언어 추가
export function useCreateLocale(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateLocaleDto) => {
      const { data } = await api.post<Locale>(
        `/projects/${projectId}/locales`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOCALES(projectId),
      });
    },
  });
}

// 언어 활성화/비활성화
export function useUpdateLocaleStatus(projectId: string, localeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateLocaleStatusDto) => {
      const { data } = await api.patch(
        `/projects/${projectId}/locales/${localeId}/status`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOCALES(projectId),
      });
    },
  });
}

