import type { MemberRole } from "@/types/api";

export const ROLE_PERMISSIONS: Record<
  MemberRole,
  {
    canEdit: boolean;
    canManageSettings: boolean;
    canManageMembers: boolean;
    canDeleteProject: boolean;
  }
> = {
  OWNER: {
    canEdit: true,
    canManageSettings: true,
    canManageMembers: true,
    canDeleteProject: true,
  },
  EDITOR: {
    canEdit: true,
    canManageSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
  VIEWER: {
    canEdit: false,
    canManageSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: "소유자",
  EDITOR: "편집자",
  VIEWER: "조회자",
};

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  OWNER: "모든 권한 (설정 변경, 멤버 관리, 삭제)",
  EDITOR: "번역 편집, 키/언어 추가/수정 (설정 변경, 멤버 관리 불가)",
  VIEWER: "읽기 전용 (모든 편집 불가)",
};

