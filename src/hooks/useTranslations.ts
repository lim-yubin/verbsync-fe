import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface TranslationMatrix {
  locales: Array<{
    code: string;
    name: string;
  }>;
  rows: Array<{
    key: string;
    description: string | null;
    translations: {
      [localeCode: string]: string;
    };
  }>;
}

interface TranslationUpdateItem {
  key: string;
  locale: string;
  value: string;
}

interface UpdateTranslationsDto {
  updates: TranslationUpdateItem[];
}

// 번역 매트릭스 조회 (Key × Locale)
export function useTranslationMatrix(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
    queryFn: async () => {
      const { data } = await api.get<TranslationMatrix>(
        `/projects/${projectId}/translations/matrix`
      );
      return data;
    },
    enabled: !!projectId,
  });
}

// 번역 일괄 업데이트
export function useUpdateTranslations(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateTranslationsDto) => {
      const { data } = await api.patch(
        `/projects/${projectId}/translations`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
      });
    },
  });
}

