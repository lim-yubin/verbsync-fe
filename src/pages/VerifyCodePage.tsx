import { useTranslation } from "react-i18next";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { AuthHero } from "@/components/auth/AuthHero";
import { Logo } from "@/components/ui/Logo";
import { AuthFooter } from "@/components/layout/AuthFooter";

export function VerifyCodePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Side - Service Introduction */}
        <div className="hidden lg:flex lg:w-1/2 border-r bg-muted/30">
          <AuthHero />
        </div>

        {/* Right Side - Verify Code Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 justify-center cursor-pointer"
              >
                <Logo width={32} height={32} />
                <h1 className="text-2xl font-bold text-foreground">
                  {t("common.appName")}
                </h1>
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("forgotPassword.verifyCodeTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("forgotPassword.verifyCodeSubtitle")}
              </p>
            </div>

            <VerifyCodeForm />
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

