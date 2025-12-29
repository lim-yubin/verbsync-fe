import { Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/subscription";
import { PLAN_LABELS } from "@/lib/plans";
import type { Plan } from "@/types/api";
import { cn } from "@/lib/utils";

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
    cta: "현재 플랜",
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
    cta: "업그레이드",
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
    cta: "업그레이드",
    featured: false,
    comingSoon: true,
  },
];

export function SubscriptionPage() {
  const { data: planInfo, isLoading } = usePlan();
  const currentPlan = planInfo?.plan || "FREE";

  const handleUpgrade = async (plan: Plan) => {
    // TODO: Paddle 결제 연동
    if (plan === "STARTER") {
      try {
        // Paddle Checkout 링크 생성 API 호출
        // const { data } = await api.post<{ url: string }>("/subscription/checkout", {
        //   plan: "STARTER",
        //   period: "month",
        // });
        // window.location.href = data.url;
        console.log("Upgrade to Starter plan - Paddle 결제 연동 예정");
      } catch (error) {
        console.error("Failed to create checkout link:", error);
      }
    } else if (plan === "PRO") {
      console.log("Upgrade to Pro plan (Coming Soon)");
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="구독 관리"
          description="현재 플랜을 확인하고 업그레이드할 수 있습니다"
        />

        {/* 현재 플랜 정보 (로그인한 경우에만 표시) */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : planInfo ? (
          <Card>
            <CardHeader>
              <CardTitle>현재 플랜</CardTitle>
              <CardDescription>
                현재 사용 중인 구독 플랜 정보입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">플랜:</span>
                <PlanBadge plan={planInfo.plan} />
              </div>
              {planInfo.planStartedAt && (
                <div className="text-sm text-muted-foreground">
                  플랜 시작일:{" "}
                  {new Date(planInfo.planStartedAt).toLocaleDateString("ko-KR")}
                </div>
              )}
              {planInfo.planEndsAt && (
                <div className="text-sm text-muted-foreground">
                  플랜 만료일:{" "}
                  {new Date(planInfo.planEndsAt).toLocaleDateString("ko-KR")}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* 플랜 선택 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlan;
            const isUpgradeable = 
              currentPlan === "FREE" && plan.name === "STARTER" ||
              (currentPlan === "STARTER" || currentPlan === "FREE") && plan.name === "PRO";

            return (
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
                  //   : "",
                  "",
                  isCurrentPlan && "ring-2 ring-primary"
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
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">현재 플랜</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{PLAN_LABELS[plan.name]}</CardTitle>
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
                      <li key={feature} className="flex items-start gap-3 text-sm">
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
                    ) : isCurrentPlan ? (
                      <Button disabled variant="outline" className="w-full">
                        현재 플랜
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        // 추후 사용 예정: featured 버튼 스타일
                        // variant={plan.featured ? "default" : "outline"}
                        className={cn(
                          "w-full cursor-pointer"
                          // 추후 사용 예정: featured 버튼 스타일
                          // plan.featured && "shadow-md"
                        )}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {isUpgradeable ? "업그레이드" : plan.cta}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 엔터프라이즈 문의 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                대규모 팀을 위한 엔터프라이즈 플랜이 필요하신가요?{" "}
                <a
                  href="mailto:support@verbsync.com"
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  영업팀에 문의하기
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

