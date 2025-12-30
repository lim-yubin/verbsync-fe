import { useTranslation } from "react-i18next";
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

export function SubscriptionPage() {
  const { t } = useTranslation();
  const { data: planInfo, isLoading } = usePlan();
  
  const plans: PlanOption[] = [
    {
      name: "FREE",
      price: "$0",
      description: t("subscription.freeDescription"),
      features: [
        t("subscription.freeFeatures1"),
        t("subscription.freeFeatures2"),
        t("subscription.freeFeatures3"),
        t("subscription.freeFeatures4"),
        t("subscription.freeFeatures5"),
      ],
      cta: t("subscription.freeCta"),
      featured: false,
    },
    {
      name: "STARTER",
      price: "$19",
      period: "/month",
      description: t("subscription.starterDescription"),
      features: [
        t("subscription.starterFeatures1"),
        t("subscription.starterFeatures2"),
        t("subscription.starterFeatures3"),
        t("subscription.starterFeatures4"),
        t("subscription.starterFeatures5"),
      ],
      cta: t("subscription.starterCta"),
      featured: false,
      comingSoon: true,
    },
    {
      name: "PRO",
      price: "$79",
      period: "/month",
      description: t("subscription.proDescription"),
      features: [
        t("subscription.proFeatures1"),
        t("subscription.proFeatures2"),
        t("subscription.proFeatures3"),
        t("subscription.proFeatures4"),
        t("subscription.proFeatures5"),
      ],
      cta: t("subscription.proCta"),
      featured: false,
      comingSoon: true,
    },
  ];
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
          title={t("subscription.title")}
          description={t("subscription.description")}
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
              <CardTitle>{t("subscription.currentPlan")}</CardTitle>
              <CardDescription>
                {t("subscription.currentPlanInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("subscription.plan")}</span>
                <PlanBadge plan={planInfo.plan} />
              </div>
              {planInfo.planStartedAt && (
                <div className="text-sm text-muted-foreground">
                  {t("settings.planStartDate")}{" "}
                  {new Date(planInfo.planStartedAt).toLocaleDateString("ko-KR")}
                </div>
              )}
              {planInfo.planEndsAt && (
                <div className="text-sm text-muted-foreground">
                  {t("settings.planEndDate")}{" "}
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
                    {t("subscription.comingSoon")}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">{t("subscription.currentPlanBadge")}</Badge>
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
                        {t("subscription.updateLater")}
                      </Button>
                    ) : isCurrentPlan ? (
                      <Button disabled variant="outline" className="w-full">
                        {t("subscription.currentPlanBadge")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className={cn("w-full cursor-pointer")}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {isUpgradeable ? t("subscription.upgrade") : plan.cta}
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
                {t("subscription.enterpriseInquiry")}{" "}
                <a
                  href="mailto:support@verbsync.com"
                  className="font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
                >
                  {t("subscription.contactSales")}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

