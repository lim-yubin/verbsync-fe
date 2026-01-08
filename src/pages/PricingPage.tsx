import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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

export function PricingPage() {
  const { t } = useTranslation();
  const [showContactSalesDialog, setShowContactSalesDialog] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

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
      cta: t("pricing.getStarted"),
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
      cta: t("pricing.starterGetStarted"),
      featured: true,
      comingSoon: false,
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
      cta: t("pricing.proGetStarted"),
      featured: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("pricing.subtitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.description")}
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
                  {t("subscription.comingSoon")}
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
                      {t("pricing.updateLater")}
                    </Button>
                  ) : (
                    <Link to={ROUTES.REGISTER} className="block">
                      <Button
                        variant="outline"
                        className={cn("w-full cursor-pointer")}
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
            {t("pricing.enterpriseInquiry")}{" "}
            <button
              onClick={() => setShowContactSalesDialog(true)}
              className="font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
            >
              {t("pricing.contactSales")}
            </button>
          </p>
        </div>

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
    </div>
  );
}
