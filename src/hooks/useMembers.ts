import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  ProjectMember,
  MembersResponse,
  InviteMemberDto,
  UpdateMemberRoleDto,
  MemberPermissions,
  InviteInfo,
  AcceptInviteResponse,
} from "@/types/api";

// 멤버 목록 조회 (계정 단위)
export function useMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get<MembersResponse>("/members");
      return data.members;
    },
  });
}

// 현재 사용자 권한 조회 (계정 단위)
export function useMemberPermissions() {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBER_PERMISSIONS,
    queryFn: async () => {
      const { data } = await api.get<MemberPermissions>("/members/me");
      return data;
    },
  });
}

// 멤버 초대 (계정 단위)
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: InviteMemberDto) => {
      const { data } = await api.post<ProjectMember>("/members/invite", dto);
      return data;
    },
    onSuccess: () => {
      // 멤버 목록 갱신
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBERS,
      });
    },
  });
}

// 멤버 역할 변경 (계정 단위)
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      dto,
    }: {
      memberId: string;
      dto: UpdateMemberRoleDto;
    }) => {
      const { data } = await api.patch<ProjectMember>(
        `/members/${memberId}/role`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      // 멤버 목록 갱신
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBERS,
      });
      // 권한 정보도 갱신 (자신의 역할이 변경될 수 있음)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBER_PERMISSIONS,
      });
    },
  });
}

// 멤버 제거 (계정 단위)
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/members/${memberId}`);
    },
    onSuccess: () => {
      // 멤버 목록 갱신
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBERS,
      });
      // 권한 정보도 갱신 (자신이 제거될 수 있음)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBER_PERMISSIONS,
      });
    },
  });
}

// 초대 정보 조회 (인증 불필요)
export function useGetInviteInfo(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data } = await api.get<InviteInfo>(`/members/invite/${token}`);
      return data;
    },
    enabled: !!token,
  });
}

// 초대 수락 (인증 필요)
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post<AcceptInviteResponse>(
        `/members/invite/${token}/accept`
      );
      return data;
    },
    onSuccess: () => {
      // 멤버 목록 갱신
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBERS,
      });
      // 권한 정보도 갱신
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MEMBER_PERMISSIONS,
      });
    },
  });
}

