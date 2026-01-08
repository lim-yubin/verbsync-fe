import type { Plan } from "@/types/api";
import type { TFunction } from "i18next";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

/**
 * 플랜 설명을 다국어로 반환
 * @param t i18n 번역 함수
 * @param plan 플랜 타입
 * @returns 번역된 플랜 설명
 */
export function getPlanDescription(t: TFunction, plan: Plan): string {
  return t(`plans.descriptions.${plan}`);
}

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
export function getPlanLimit(
  plan: Plan,
  type: "projects" | "keys" | "locales" | "members"
): number {
  return PLAN_LIMITS[plan][type];
}

export function canCreateProject(
  plan: Plan,
  currentProjectCount: number
): boolean {
  const limit = getPlanLimit(plan, "projects");
  // Infinity인 경우 항상 true
  if (limit === Infinity) return true;
  // 현재 개수가 제한 이하이면 생성 가능
  return currentProjectCount < limit;
}

export function canAddKey(plan: Plan, currentKeyCount: number): boolean {
  const limit = getPlanLimit(plan, "keys");
  // Infinity인 경우 항상 true
  if (limit === Infinity) return true;
  // 현재 개수가 제한 이하이면 추가 가능
  return currentKeyCount <= limit;
}

export function canAddLocale(plan: Plan, currentLocaleCount: number): boolean {
  const limit = getPlanLimit(plan, "locales");
  // Infinity인 경우 항상 true
  if (limit === Infinity) return true;
  // 현재 개수가 제한 이하이면 추가 가능
  return currentLocaleCount <= limit;
}

export function canInviteMember(
  plan: Plan,
  currentMemberCount: number
): boolean {
  const limit = getPlanLimit(plan, "members");
  // Infinity인 경우 항상 true
  if (limit === Infinity) return true;
  // 현재 개수가 제한 이하이면 초대 가능
  return currentMemberCount <= limit;
}

/**
 * 실제 사용 가능한 플랜 계산
 * 구독 취소 후 planEndsAt까지는 유료 플랜 기능 사용 가능
 * @param plan DB에 저장된 플랜
 * @param planEndsAt 구독 만료일 (null이면 만료 없음)
 * @returns 실제 사용 가능한 플랜
 */
export function getEffectivePlan(
  plan: Plan,
  planEndsAt: string | null
): Plan {
  // planEndsAt이 없으면 현재 플랜 그대로 사용
  if (!planEndsAt) {
    return plan;
  }

  // planEndsAt이 미래 날짜면 유료 플랜 기능 사용 가능
  const now = new Date();
  const endsAt = new Date(planEndsAt);
  
  if (endsAt > now) {
    // 만료일이 지나지 않았으면 원래 플랜 사용
    // 단, plan이 FREE면 FREE 그대로
    return plan;
  }

  // 만료일이 지났으면 FREE로 전환
  return "FREE";
}

/**
 * 업그레이드 메시지를 다국어로 반환
 * @param t i18n 번역 함수
 * @param plan 현재 플랜
 * @param type 제한 타입 (projects, keys, locales, members)
 * @returns 번역된 업그레이드 메시지
 */
export function getUpgradeMessage(
  t: TFunction,
  plan: Plan,
  type: "projects" | "keys" | "locales" | "members"
): string {
  const typeLabel = t(`plans.typeLabels.${type}`);

  if (plan === "FREE") {
    return t("plans.upgradeToStarter", { type: typeLabel });
  } else if (plan === "STARTER") {
    return t("plans.upgradeToPro", { type: typeLabel });
  }
  return "";
}
