import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { ROUTES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { PlanBadge } from "@/components/subscription";

export function SubscriptionSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: planInfo, refetch, isLoading } = usePlan();
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);
  const pollCountRef = useRef(0);
  const MAX_POLL_COUNT = 20; // 최대 20번 (약 10초)

  // 플랜 정보 새로고침 (Webhook 처리 대기)
  useEffect(() => {
    // 즉시 한 번 refetch
    refetch();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAN });

    // Webhook 처리를 위해 짧은 간격으로 polling
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        pollCountRef.current += 1;
        const newCount = pollCountRef.current;

        // 최대 시도 횟수에 도달하면 중지
        if (newCount >= MAX_POLL_COUNT) {
          setIsCheckingPlan(false);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return;
        }

        // 플랜 정보 refetch
        refetch().then(() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAN });
        });
      }, 500); // 0.5초마다 체크
    };

    startPolling();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refetch, queryClient]);

  // 플랜이 업그레이드되면 polling 중지
  useEffect(() => {
    if (planInfo?.plan === "STARTER" || planInfo?.plan === "PRO") {
      // 다음 렌더 사이클에서 상태 업데이트
      setTimeout(() => {
        setIsCheckingPlan(false);
      }, 0);
    }
  }, [planInfo?.plan]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <CardTitle className="text-2xl">
                {t("subscription.paymentSuccess")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t("subscription.paymentSuccessDescription")}
            </p>

            {/* 플랜 정보 확인 중 */}
            {isCheckingPlan && (
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t("subscription.checkingPlan") ||
                      "플랜 정보를 확인하는 중..."}
                  </span>
                </div>
              </div>
            )}

            {/* 플랜 정보 표시 */}
            {planInfo && !isCheckingPlan && (
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {t("subscription.currentPlan")}:
                  </span>
                  <PlanBadge plan={planInfo.plan} />
                </div>
                {planInfo.planStartedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("subscription.planStartDate")}:{" "}
                    {new Date(planInfo.planStartedAt).toLocaleDateString(
                      "ko-KR"
                    )}
                  </p>
                )}
              </div>
            )}

            {/* 플랜 정보가 아직 로드되지 않은 경우 */}
            {!planInfo && !isLoading && !isCheckingPlan && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  {t("subscription.planUpdatePending") ||
                    "플랜 업데이트가 진행 중입니다. 잠시 후 새로고침해주세요."}
                </p>
              </div>
            )}
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="w-full cursor-pointer"
            >
              {t("subscription.goToDashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
