import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { AuthFooter } from "@/components/layout/AuthFooter";
import { ROUTES } from "@/lib/constants";

export function VerifyEmailSuccessPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-2">
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>{t("verifyEmailSuccess.title")}</CardTitle>
              <CardDescription>
                {t("verifyEmailSuccess.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                {t("verifyEmailSuccess.message")}
              </div>
              <Button asChild className="w-full cursor-pointer">
                <Link to={ROUTES.LOGIN}>{t("verifyEmailSuccess.login")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

