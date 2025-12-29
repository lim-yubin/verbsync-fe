import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LABELS } from "@/lib/plans";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/api";

interface PlanOption {
  name: Plan;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  comingSoon?: boolean;
}

const plans: PlanOption[] = [
  {
    name: "FREE",
    price: "$0",
    description: "개인 개발자 및 사이드 프로젝트를 위한 무료 플랜",
    features: [
      "프로젝트 1개",
      "번역 키 100개",
      "언어 3개 지원",
      "실시간 OTA 업데이트",
      "도메인 보안 설정",
    ],
    cta: "무료로 시작하기",
    featured: false,
  },
  {
    name: "STARTER",
    price: "$19",
    period: "/month",
    description: "성장하는 프로젝트와 소규모 팀을 위한 플랜",
    features: [
      "프로젝트 5개",
      "번역 키 1,000개",
      "언어 10개 지원",
      "Excel/CSV Import & Export",
      "팀 멤버 초대 (최대 3명)",
    ],
    cta: "스타터 시작하기",
    featured: false, // 추후 사용 예정: true로 변경 가능
    comingSoon: true,
  },
  {
    name: "PRO",
    price: "$79",
    period: "/month",
    description: "대규모 프로젝트와 전문적인 관리가 필요한 팀",
    features: [
      "프로젝트 무제한",
      "번역 키 10,000개",
      "모든 언어 무제한 지원",
      "AI 자동 번역 (1,000회/월)",
      "번역 히스토리 및 롤백",
    ],
    cta: "프로 시작하기",
    featured: false,
    comingSoon: true,
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            간단하고 투명한 가격
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            프로젝트 규모에 맞는 최적의 플랜을 선택하세요.
          </p>
        </div>

        {/* 플랜 선택 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col transition-all duration-300",
                plan.comingSoon
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:shadow-lg",
                // 추후 사용 예정: featured 스타일
                // plan.featured
                //   ? "border-primary/50 ring-1 ring-primary/20"
                //   : ""
                ""
              )}
            >
              {/* 추후 사용 예정: Most Popular 배지 */}
              {/* {plan.featured && !plan.comingSoon && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Most Popular
                </div>
              )} */}
              {plan.comingSoon && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Coming Soon
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">
                  {PLAN_LABELS[plan.name]}
                </CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {plan.comingSoon ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full cursor-not-allowed"
                    >
                      추후 업데이트 예정
                    </Button>
                  ) : (
                    <Link to={ROUTES.REGISTER} className="block">
                      <Button
                        variant="outline"
                        // 추후 사용 예정: featured 버튼 스타일
                        // variant={plan.featured ? "default" : "outline"}
                        className={cn(
                          "w-full cursor-pointer"
                          // 추후 사용 예정: featured 버튼 스타일
                          // plan.featured && "shadow-md"
                        )}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 엔터프라이즈 문의 */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            대규모 팀을 위한 엔터프라이즈 플랜이 필요하신가요?{" "}
            <a
              href="mailto:verbsync@gmail.com"
              className="font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
            >
              영업팀에 문의하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
