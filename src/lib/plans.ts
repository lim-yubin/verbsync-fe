import type { Plan } from "@/types/api";

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "무료",
  STARTER: "스타터",
  PRO: "프로",
  ENTERPRISE: "엔터프라이즈",
};

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  FREE: "개인 개발자 및 사이드 프로젝트를 위한 무료 플랜",
  STARTER: "성장하는 프로젝트와 소규모 팀을 위한 플랜",
  PRO: "대규모 프로젝트와 전문적인 관리가 필요한 팀",
  ENTERPRISE: "대기업, 대규모 조직, 엔터프라이즈급 요구사항",
};

