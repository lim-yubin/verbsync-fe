import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function RefundPage() {
  const { t, i18n } = useTranslation();
  const dateFormatLocale = i18n.language === "ko" ? ko : enUS;
  const dateFormat = i18n.language === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← {t("refund.backToHome")}
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {t("refund.title")}
        </h1>
        <p className="text-muted-foreground mb-12">
          {t("refund.lastUpdated")}{" "}
          {format(new Date(), dateFormat, { locale: dateFormatLocale })}
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section1Title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refund.section1Content1")}{" "}
              <strong className="text-foreground">
                {t("refund.section1Content2")}
              </strong>
              {t("refund.section1Content3")}{" "}
              <strong className="text-foreground">
                {t("refund.section1Content4")}
              </strong>
              {t("refund.section1Content5")}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("refund.section1Content6")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section2Title")}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t("refund.section2Highlight")}
                </p>
                <p className="leading-relaxed">
                  {t("refund.section2Content1")}{" "}
                  <strong className="text-foreground">
                    {t("refund.section2Content2")}
                  </strong>{" "}
                  {t("refund.section2Content3")}{" "}
                  <strong className="text-foreground">
                    {t("refund.section2Content4")}
                  </strong>{" "}
                  {t("refund.section2Content5")}
                </p>
              </div>
              <p className="leading-relaxed">{t("refund.section2Content6")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section3Title")}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("refund.section3Content1")}{" "}
                <strong className="text-foreground">
                  {t("refund.section3Content2")}
                </strong>
                {t("refund.section3Content3")}
              </p>
              <p>
                {t("refund.section3Content4")}{" "}
                <strong className="text-foreground">
                  {t("refund.section3Content5")}
                </strong>{" "}
                {t("refund.section3Content6")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section4Title")}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("refund.section4Content1")}</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">
                  {t("refund.section4Content2")}
                </p>
                <p>
                  {t("refund.section4Content3")}{" "}
                  <a
                    href="https://paddle.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline cursor-pointer"
                  >
                    https://paddle.net
                  </a>
                </p>
              </div>

              {/* Extra clarity to avoid review ambiguity */}
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <p className="text-sm leading-relaxed text-foreground">
                  <strong>{t("refund.section4Important")}</strong>{" "}
                  {t("refund.section4Content4")}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section5Title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refund.section5Content1")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section6Title")}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("refund.section6Content1")}</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <a
                  href="https://www.paddle.com/legal/invoiced-consumer-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all cursor-pointer"
                >
                  https://www.paddle.com/legal/invoiced-consumer-terms
                </a>
              </div>
            </div>
          </section>

          {/* ✅ Updated section to reduce Paddle review risk */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {t("refund.section7Title")}
            </h2>
            <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-muted-foreground">
              <p>
                {t("refund.section7Content1")}{" "}
                <strong className="text-foreground">
                  {t("refund.section7Content2")}
                </strong>{" "}
                {t("refund.section7Content3")}
              </p>
              <div>
                <p className="font-semibold text-foreground mb-2">
                  {t("refund.section7Content4")}
                </p>
                <p>{t("refund.section7Content5")} verbsync@gmail.com</p>
                <p className="mt-2">{t("refund.section7Content6")}</p>
              </div>

              <p className="text-sm mt-4">
                {t("refund.section7Content7")}{" "}
                <strong className="text-foreground">
                  {t("refund.section7Content8")}
                </strong>{" "}
                {t("refund.section7Content9")}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            {t("refund.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
