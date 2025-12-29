// ========== User ==========
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Auth ==========
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  requiresEmailVerification: boolean;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ========== Project ==========
export interface Project {
  id: string;
  name: string;
  defaultLocale: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // 도메인 제한 설정
  allowedDomains?: string[]; // 허용된 도메인 목록 (예: ["example.com", "app.example.com"])
  // 멤버 정보 (프로젝트 목록 조회 시 포함)
  isOwner?: boolean; // 자신이 소유자인지 여부
  role?: "OWNER" | "EDITOR" | "VIEWER"; // 자신의 역할
}

export interface ProjectApiKey {
  apiKey: string;
}

export interface CreateProjectDto {
  name: string;
  defaultLocale: string;
}

export interface UpdateProjectDto {
  name?: string;
  defaultLocale?: string;
  allowedDomains?: string[]; // 도메인 제한 설정
}

// ========== Locale ==========
export interface Locale {
  id: string;
  projectId: string;
  code: string; // "en", "ko", "ja"
  name: string; // "English", "한국어"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocaleDto {
  code: string;
  name: string;
}

export interface UpdateLocaleStatusDto {
  isActive: boolean;
}

// ========== Key ==========
export interface Key {
  id: string;
  projectId: string;
  name: string; // "login.title"
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyDto {
  name: string;
  description?: string;
}

export interface UpdateKeyDto {
  name?: string;
  description?: string;
}

// ========== Translation ==========
export interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationUpdateItem {
  key: string;
  locale: string;
  value: string;
}

export interface UpdateTranslationsDto {
  updates: TranslationUpdateItem[];
}

// ========== Translation Matrix (테이블용) ==========
export interface TranslationMatrix {
  locales: Array<{
    code: string;
    name: string;
  }>;
  rows: Array<{
    key: string;
    description: string | null;
    translations: {
      [localeCode: string]: string; // { "en": "Login", "ko": "로그인" }
    };
  }>;
}

// ========== Member ==========
export type MemberRole = "OWNER" | "EDITOR" | "VIEWER";

export type MemberStatus = "ACTIVE" | "PENDING";

export interface ProjectMember {
  id: string;
  userId: string | null; // PENDING 상태면 null
  projectId: string;
  role: MemberRole;
  status: MemberStatus;
  user: {
    id: string;
    email: string;
    name: string;
  } | null; // PENDING 상태면 null
  invitedAt: string;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberDto {
  email: string;
  role: "EDITOR" | "VIEWER"; // Owner는 초대 불가
}

export interface UpdateMemberRoleDto {
  role: "EDITOR" | "VIEWER"; // Owner는 변경 불가
}

export interface MemberPermissions {
  role: MemberRole;
  permissions: {
    canEdit: boolean;
    canManageSettings: boolean;
    canManageMembers: boolean;
    canDeleteProject: boolean;
  };
}

export interface MembersResponse {
  members: ProjectMember[];
}

// ========== Invite ==========
export interface InviteInfo {
  inviteToken: string;
  email: string;
  role: MemberRole;
  accountOwner: {
    name: string;
    email: string;
  };
  isUserRegistered: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export interface AcceptInviteResponse {
  id: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  account: {
    id: string;
    email: string;
    name: string;
  };
}

// ========== Subscription ==========
export type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface PlanFeatures {
  canExportExcel: boolean;
  canImport: boolean;
  canInviteMembers: boolean;
}

export interface PlanInfo {
  plan: Plan;
  features: PlanFeatures;
  planStartedAt: string | null;
  planEndsAt: string | null;
}
