import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function PrivacyPage() {
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
            ← {t("privacy.backToHome")}
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("privacy.title")}</h1>
        <p className="text-muted-foreground mb-12">
          {t("privacy.lastUpdated")}{" "}
          {format(new Date(), dateFormat, { locale: dateFormatLocale })}
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section1Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section1Content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section2Title")}</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">{t("privacy.section2Sub1Title")}</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">{t("privacy.section2Required")}</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section2Required1")}</li>
                <li>{t("privacy.section2Required2")}</li>
                <li>{t("privacy.section2Required3")}</li>
              </ul>

              <p className="mt-4">
                <strong className="text-foreground">{t("privacy.section2Auto")}</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section2Auto1")}</li>
                <li>{t("privacy.section2Auto2")}</li>
              </ul>

              <p className="mt-4">
                <strong className="text-foreground">{t("privacy.section2Generated")}</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section2Generated1")}</li>
                <li>{t("privacy.section2Generated2")}</li>
                <li>{t("privacy.section2Generated3")}</li>
                <li>{t("privacy.section2Generated4")}</li>
                <li>{t("privacy.section2Generated5")}</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">{t("privacy.section2Sub2Title")}</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t("privacy.section2Method1")}</li>
              <li>{t("privacy.section2Method2")}</li>
              <li>{t("privacy.section2Method3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section3Title")}</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">{t("privacy.section3Purpose1")}</strong> {t("privacy.section3Purpose1Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section3Purpose2")}</strong> {t("privacy.section3Purpose2Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section3Purpose3")}</strong> {t("privacy.section3Purpose3Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section3Purpose4")}</strong> {t("privacy.section3Purpose4Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section3Purpose5")}</strong> {t("privacy.section3Purpose5Content")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section4Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("privacy.section4Content1")}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">{t("privacy.section4Member")}</strong> {t("privacy.section4MemberContent")}
                </li>
                <li>
                  <strong className="text-foreground">{t("privacy.section4Usage")}</strong> {t("privacy.section4UsageContent")}
                </li>
                <li>
                  <strong className="text-foreground">{t("privacy.section4Payment")}</strong> {t("privacy.section4PaymentContent")}
                </li>
                <li>
                  <strong className="text-foreground">{t("privacy.section4Contract")}</strong> {t("privacy.section4ContractContent")}
                </li>
              </ul>
              <p className="mt-4">
                {t("privacy.section4Content2")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section5Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section5Content1")}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>{t("privacy.section5Exception1")}</li>
              <li>
                {t("privacy.section5Exception2")}
              </li>
              <li>
                {t("privacy.section5Exception3")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section6Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("privacy.section6Content1")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">{t("privacy.section6TableHeader1")}</th>
                    <th className="border border-border p-3 text-left">{t("privacy.section6TableHeader2")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">{t("privacy.section6TableRow1Col1")}</td>
                    <td className="border border-border p-3">{t("privacy.section6TableRow1Col2")}</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">{t("privacy.section6TableRow2Col1")}</td>
                    <td className="border border-border p-3">{t("privacy.section6TableRow2Col2")}</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">{t("privacy.section6TableRow3Col1")}</td>
                    <td className="border border-border p-3">{t("privacy.section6TableRow3Col2")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              {t("privacy.section6Content2")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section7Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("privacy.section7Content1")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section7Right1")}</li>
                <li>{t("privacy.section7Right2")}</li>
                <li>{t("privacy.section7Right3")}</li>
                <li>{t("privacy.section7Right4")}</li>
              </ul>
              <p className="mt-4">
                {t("privacy.section7Content2")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section8Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("privacy.section8Content1")}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">{t("privacy.section8Procedure")}</strong> {t("privacy.section8ProcedureContent")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section8Method")}</strong> {t("privacy.section8MethodContent")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section9Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("privacy.section9Content1")}
            </p>
            <div className="bg-muted/50 p-6 rounded-lg space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">{t("privacy.section9Title2")}</strong>
              </p>
              <p>{t("privacy.section9Email")} verbsync@gmail.com</p>
              <p className="mt-4">
                {t("privacy.section9Content2")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section10Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("privacy.section10Content1")}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">{t("privacy.section10Measure1")}</strong> {t("privacy.section10Measure1Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section10Measure2")}</strong> {t("privacy.section10Measure2Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section10Measure3")}</strong> {t("privacy.section10Measure3Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section10Measure4")}</strong> {t("privacy.section10Measure4Content")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacy.section10Measure5")}</strong> {t("privacy.section10Measure5Content")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section11Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("privacy.section11Content1")}
              </p>
              <p>
                <strong className="text-foreground">{t("privacy.section11Purpose")}</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("privacy.section11Purpose1")}</li>
                <li>{t("privacy.section11Purpose2")}</li>
                <li>{t("privacy.section11Purpose3")}</li>
              </ul>
              <p className="mt-4">
                {t("privacy.section11Content2")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("privacy.section12Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section12Content")}
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            {t("privacy.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

