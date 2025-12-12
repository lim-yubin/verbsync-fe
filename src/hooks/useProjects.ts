import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface Project {
  id: string;
  name: string;
  defaultLocale: string;
  apiKey: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProjectDto {
  name: string;
  defaultLocale: string;
}

// 프로젝트 목록 조회
export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: async () => {
      const { data } = await api.get<Project[]>("/projects");
      return data;
    },
  });
}

// 프로젝트 생성
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateProjectDto) => {
      const { data } = await api.post<Project>("/projects", dto);
      return data;
    },
    onSuccess: () => {
      // 프로젝트 목록 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
    },
  });
}

// 프로젝트 상세 조회
export function useProject(projectId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROJECTS, projectId],
    queryFn: async () => {
      const { data } = await api.get<Project>(`/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

