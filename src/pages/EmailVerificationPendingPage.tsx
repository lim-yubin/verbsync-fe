import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { AuthFooter } from "@/components/layout/AuthFooter";
import { ROUTES } from "@/lib/constants";
import { api } from "@/lib/api";

export function EmailVerificationPendingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error(t("emailVerificationPending.emailNotFound"));
      return;
    }

    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success(t("emailVerificationPending.resendSuccess"));
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || t("emailVerificationPending.resendFailed")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 justify-center cursor-pointer"
            >
              <Logo width={32} height={32} />
              <h1 className="text-2xl font-bold text-foreground">{t("common.appName")}</h1>
            </a>
          </div>

          <Card className="w-full border shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>{t("emailVerificationPending.title")}</CardTitle>
              <CardDescription>
                {t("emailVerificationPending.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">{email}</strong> {t("emailVerificationPending.emailSent")}
                </p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("emailVerificationPending.checkEmail")}</p>
                <p className="text-xs">
                  {t("emailVerificationPending.spamFolder")}
                  <br />
                  {t("emailVerificationPending.linkExpiry")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("emailVerificationPending.resending")}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("emailVerificationPending.resend")}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  variant="ghost"
                  className="w-full cursor-pointer"
                >
                  {t("emailVerificationPending.goToLogin")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

