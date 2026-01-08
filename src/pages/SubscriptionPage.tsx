import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, AlertTriangle, Copy, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePlan, useCancelSubscription } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/subscription";
import { PLAN_LABELS } from "@/lib/plans";
import type { Plan } from "@/types/api";
import { cn } from "@/lib/utils";
import { initializePaddle, openPaddleCheckout } from "@/lib/paddle";
import { useAuthStore } from "@/store/authStore";

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
  const { mutate: cancelSubscription, isPending: isCancelling } =
    useCancelSubscription();
  const user = useAuthStore((state) => state.user);
  const [isPaddleInitialized, setIsPaddleInitialized] = useState(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showContactSalesDialog, setShowContactSalesDialog] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Paddle.js 초기화
  useEffect(() => {
    initializePaddle()
      .then(() => {
        setIsPaddleInitialized(true);
      })
      .catch((error) => {
        console.error("Failed to initialize Paddle.js:", error);
        toast.error("Paddle 초기화에 실패했습니다.");
      });
  }, []);

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
      featured: true,
      comingSoon: false, // Starter 플랜 결제 활성화
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

  const handleUpgrade = async (plan: Plan) => {
    if (plan === "STARTER") {
      // Paddle.js가 초기화되지 않았으면 초기화 대기
      if (!isPaddleInitialized) {
        toast.error(
          "Paddle이 아직 초기화되지 않았습니다. 잠시 후 다시 시도해주세요."
        );
        return;
      }

      // 환경 변수에서 Price ID 가져오기
      const priceId = import.meta.env.VITE_PADDLE_STARTER_MONTHLY_PRICE_ID;

      if (!priceId) {
        toast.error(
          "Price ID가 설정되지 않았습니다. 환경 변수를 확인해주세요."
        );
        console.error("VITE_PADDLE_STARTER_MONTHLY_PRICE_ID is not set");
        return;
      }

      // 사용자 ID 확인
      if (!user?.id) {
        toast.error("사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      setIsOpeningCheckout(true);

      try {
        // Paddle.js를 사용하여 Checkout 열기
        // customData에 userId를 포함하여 Webhook에서 플랜 업그레이드에 사용
        await openPaddleCheckout({
          priceId,
          customerEmail: user.email, // Paddle Customer 식별용
          customData: {
            userId: user.id, // Webhook에서 플랜 업그레이드에 사용
            plan: "STARTER",
            period: "month",
          },
          successUrl: `${window.location.origin}/subscription/success`,
        });
      } catch (error) {
        console.error("Failed to open Paddle checkout:", error);
        toast.error(t("subscription.checkoutFailed"));
      } finally {
        setIsOpeningCheckout(false);
      }
    } else if (plan === "PRO") {
      toast.info(t("subscription.proComingSoon"));
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
                <span className="text-sm font-medium">
                  {t("subscription.plan")}
                </span>
                {/* 구독 취소 후 만료일 전: originalPlan 표시 (취소된 플랜), 만료일 후: plan 표시 (FREE) */}
                <PlanBadge
                  plan={
                    planInfo.planEndsAt &&
                    new Date(planInfo.planEndsAt) > new Date() &&
                    planInfo.originalPlan
                      ? planInfo.originalPlan
                      : planInfo.plan
                  }
                />
                {/* 구독 취소 상태 배지 (planEndsAt이 있고 아직 만료되지 않았을 때만) */}
                {planInfo.planEndsAt &&
                  new Date(planInfo.planEndsAt) > new Date() && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
                    >
                      {t("subscription.cancelled")}
                    </Badge>
                  )}
              </div>

              {/* 구독 취소 알림 (만료일이 아직 지나지 않았을 때만 표시) */}
              {planInfo.planEndsAt &&
                new Date(planInfo.planEndsAt) > new Date() && (
                  <div className="rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-3">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                      {t("subscription.cancellationNotice")}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      {t("subscription.cancellationDescription")}
                    </p>
                  </div>
                )}

              {/* 구독 시작일 */}
              {planInfo.planStartedAt && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    {t("subscription.subscriptionStartDate")}:
                  </span>{" "}
                  {new Date(planInfo.planStartedAt).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              )}

              {/* 구독 만료일 (취소한 경우, 만료일이 아직 지나지 않았을 때만 표시) */}
              {planInfo.planEndsAt &&
                new Date(planInfo.planEndsAt) > new Date() && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    <span className="font-medium">
                      {t("subscription.subscriptionEndDate")}:
                    </span>{" "}
                    {new Date(planInfo.planEndsAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <span className="ml-2 text-xs">
                      ({t("subscription.willExpire")})
                    </span>
                  </div>
                )}

              {/* 구독 취소 버튼 (유료 플랜인 경우, 취소하지 않은 경우) */}
              {(planInfo.plan === "STARTER" || planInfo.plan === "PRO") &&
                !planInfo.planEndsAt && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer text-destructive hover:text-destructive"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      {t("subscription.cancelSubscription")}
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        ) : null}

        {/* 플랜 선택 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            // 현재 플랜 확인: planInfo가 로드되었고 plan이 일치할 때만 true
            const isCurrentPlan = planInfo?.plan && plan.name === planInfo.plan;

            // 플랜 순서 정의 (낮은 순서부터)
            const planOrder: Plan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

            // 업그레이드/다운그레이드 가능 여부 확인
            const actualCurrentPlan = planInfo?.plan ?? "FREE";
            const currentPlanIndex = planOrder.indexOf(actualCurrentPlan);
            const targetPlanIndex = planOrder.indexOf(plan.name);

            // 현재 플랜이 아닐 때만 업그레이드/다운그레이드 가능
            const isUpgradeable =
              !isCurrentPlan &&
              currentPlanIndex >= 0 &&
              targetPlanIndex >= 0 &&
              targetPlanIndex > currentPlanIndex;

            const isDowngradeable =
              !isCurrentPlan &&
              currentPlanIndex >= 0 &&
              targetPlanIndex >= 0 &&
              targetPlanIndex < currentPlanIndex;

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
                {plan.featured && !plan.comingSoon && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("subscription.comingSoon")}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">
                      {t("subscription.currentPlanBadge")}
                    </Badge>
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
                        onClick={() => {
                          // 다운그레이드 (FREE 플랜으로 변경) = 구독 취소
                          if (isDowngradeable && plan.name === "FREE") {
                            setShowCancelDialog(true);
                          } else if (isUpgradeable) {
                            // 업그레이드
                            handleUpgrade(plan.name);
                          }
                        }}
                        disabled={
                          (isUpgradeable &&
                            (isOpeningCheckout || !isPaddleInitialized)) ||
                          (isDowngradeable && isCancelling)
                        }
                      >
                        {isOpeningCheckout
                          ? t("subscription.processing")
                          : isCancelling
                          ? t("subscription.processing")
                          : isUpgradeable
                          ? t("subscription.upgrade")
                          : isDowngradeable
                          ? t("subscription.downgrade")
                          : plan.cta}
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
                <button
                  onClick={() => setShowContactSalesDialog(true)}
                  className="font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
                >
                  {t("subscription.contactSales")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 구독 취소 확인 다이얼로그 */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {t("subscription.cancelSubscriptionTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("subscription.cancelSubscriptionDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
                className="cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  cancelSubscription(undefined, {
                    onSuccess: () => {
                      toast.success(
                        t("subscription.cancelSubscriptionSuccess")
                      );
                      setShowCancelDialog(false);
                    },
                    onError: (error: unknown) => {
                      const errorMessage =
                        error &&
                        typeof error === "object" &&
                        "response" in error &&
                        error.response &&
                        typeof error.response === "object" &&
                        "data" in error.response &&
                        error.response.data &&
                        typeof error.response.data === "object" &&
                        "message" in error.response.data &&
                        typeof error.response.data.message === "string"
                          ? error.response.data.message
                          : t("subscription.cancelSubscriptionError");
                      toast.error(errorMessage);
                    },
                  });
                }}
                disabled={isCancelling}
                className="cursor-pointer"
              >
                {isCancelling
                  ? t("subscription.processing")
                  : t("subscription.confirmCancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 영업팀 문의 다이얼로그 */}
        <Dialog
          open={showContactSalesDialog}
          onOpenChange={setShowContactSalesDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("subscription.contactSalesTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("subscription.contactSalesDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sales-email">
                  {t("subscription.contactSalesEmailLabel")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="sales-email"
                    value="verbsync@gmail.com"
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          "verbsync@gmail.com"
                        );
                        setEmailCopied(true);
                        toast.success(t("subscription.emailCopied"));
                        setTimeout(() => setEmailCopied(false), 2000);
                      } catch {
                        toast.error(t("subscription.emailCopyFailed"));
                      }
                    }}
                  >
                    {emailCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowContactSalesDialog(false)}
                >
                  {t("common.close")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
