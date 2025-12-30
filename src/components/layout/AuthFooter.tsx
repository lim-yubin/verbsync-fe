import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function AuthFooter() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t bg-muted/30 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={ROUTES.TERMS}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("authFooter.terms")}
            </Link>
            <Link
              to={ROUTES.PRIVACY}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("authFooter.privacy")}
            </Link>
            <Link
              to={ROUTES.REFUND}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("authFooter.refund")}
            </Link>
            <Link
              to={ROUTES.PRICING}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("authFooter.pricing")}
            </Link>
          </div>
          <div className="text-center sm:text-right">
            <p>{t("authFooter.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

