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
    // Optimistic Update: 서버 응답 전에 UI 먼저 업데이트
    onMutate: async (newKey) => {
      // 진행 중인 쿼리 취소 (낙관적 업데이트가 덮어쓰지 않도록)
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.KEYS(projectId),
      });

      // 이전 데이터 백업 (롤백용)
      const previousMatrix = queryClient.getQueryData(
        QUERY_KEYS.TRANSLATIONS_MATRIX(projectId)
      );
      const previousKeys = queryClient.getQueryData(QUERY_KEYS.KEYS(projectId));

      // 낙관적 업데이트: 새 키를 키 목록에 추가 (정렬을 위해)
      queryClient.setQueryData(QUERY_KEYS.KEYS(projectId), (old: any) => {
        if (!old) return old;
        const newKeyData = {
          id: `temp-${Date.now()}`,
          projectId,
          name: newKey.name,
          description: newKey.description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, newKeyData].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // 낙관적 업데이트: 새 키를 매트릭스에 추가 (마지막에 추가, 정렬은 프론트에서 처리)
      queryClient.setQueryData(
        QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            rows: [
              ...old.rows,
              {
                key: newKey.name,
                description: newKey.description || null,
                translations: {},
              },
            ],
          };
        }
      );

      return { previousMatrix, previousKeys };
    },
    onError: (err, newKey, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousMatrix) {
        queryClient.setQueryData(
          QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
          context.previousMatrix
        );
      }
      if (context?.previousKeys) {
        queryClient.setQueryData(QUERY_KEYS.KEYS(projectId), context.previousKeys);
      }
    },
    onSuccess: () => {
      // 키 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.KEYS(projectId),
      });
      // 번역 매트릭스 쿼리 무효화 (서버 데이터로 최종 동기화)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
      });
    },
  });
}

