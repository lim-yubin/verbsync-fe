import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectApiKey,
  MembersResponse,
} from "@/types/api";

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
    queryKey: QUERY_KEYS.PROJECT(projectId),
    queryFn: async () => {
      const { data } = await api.get<Project>(`/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

// 프로젝트 API Key 조회
export function useProjectApiKey(projectId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROJECT(projectId), "api-key"],
    queryFn: async () => {
      const { data } = await api.get<ProjectApiKey>(
        `/projects/${projectId}/api-key`
      );
      return data;
    },
    enabled: !!projectId,
    staleTime: Infinity, // API Key는 자주 바뀌지 않으므로 무한대 설정
    retry: false, // 에러 시 재시도하지 않음 (권한 없음 에러는 재시도 불필요)
  });
}

// 프로젝트 수정
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateProjectDto) => {
      const { data } = await api.patch<Project>(`/projects/${projectId}`, dto);
      return data;
    },
    onSuccess: () => {
      // 프로젝트 목록 및 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(projectId) });
    },
  });
}

// 프로젝트 삭제
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await api.delete<{ message: string }>(`/projects/${projectId}`);
      return data;
    },
    onSuccess: () => {
      // 프로젝트 목록 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
    },
  });
}

// 프로젝트 멤버 목록 조회
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROJECT(projectId), "members"],
    queryFn: async () => {
      const { data } = await api.get<MembersResponse>(`/projects/${projectId}/members`);
      return data.members;
    },
    enabled: !!projectId,
  });
}

