import type { Plan } from "@/types/api";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  FREE: "개인 개발자 및 사이드 프로젝트를 위한 무료 플랜",
  STARTER: "성장하는 프로젝트와 소규모 팀을 위한 플랜",
  PRO: "대규모 프로젝트와 전문적인 관리가 필요한 팀",
  ENTERPRISE: "대기업, 대규모 조직, 엔터프라이즈급 요구사항",
};

// ========== 플랜별 사용량 제한 ==========
export const PLAN_LIMITS = {
  FREE: {
    projects: 1,
    keys: 100,
    locales: 3,
    members: 1,
  },
  STARTER: {
    projects: 5,
    keys: 1000,
    locales: 10,
    members: 3,
  },
  PRO: {
    projects: Infinity,
    keys: 10000,
    locales: Infinity,
    members: Infinity,
  },
  ENTERPRISE: {
    projects: Infinity,
    keys: Infinity,
    locales: Infinity,
    members: Infinity,
  },
} as const;

// ========== 플랜 제한 체크 유틸리티 ==========
export function getPlanLimit(plan: Plan, type: "projects" | "keys" | "locales" | "members"): number {
  return PLAN_LIMITS[plan][type];
}

export function canCreateProject(plan: Plan, currentProjectCount: number): boolean {
  const limit = getPlanLimit(plan, "projects");
  return currentProjectCount < limit;
}

export function canAddKey(plan: Plan, currentKeyCount: number): boolean {
  const limit = getPlanLimit(plan, "keys");
  return currentKeyCount < limit;
}

export function canAddLocale(plan: Plan, currentLocaleCount: number): boolean {
  const limit = getPlanLimit(plan, "locales");
  return currentLocaleCount < limit;
}

export function canInviteMember(plan: Plan, currentMemberCount: number): boolean {
  const limit = getPlanLimit(plan, "members");
  return currentMemberCount < limit;
}

export function getUpgradeMessage(plan: Plan, type: "projects" | "keys" | "locales" | "members"): string {
  const typeLabels = {
    projects: "프로젝트",
    keys: "번역 키",
    locales: "언어",
    members: "멤버",
  };

  if (plan === "FREE") {
    return `Starter 플랜으로 업그레이드하면 ${typeLabels[type]} 제한이 늘어납니다.`;
  } else if (plan === "STARTER") {
    return `Pro 플랜으로 업그레이드하면 ${typeLabels[type]} 제한이 늘어납니다.`;
  }
  return "";
}

