import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function TermsPage() {
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
            ← {t("terms.backToHome")}
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("terms.title")}</h1>
        <p className="text-muted-foreground mb-12">
          {t("terms.lastUpdated")}{" "}
          {format(new Date(), dateFormat, { locale: dateFormatLocale })}
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article1Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("terms.article1Content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article2Title")}</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                {t("terms.article2Service").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2User").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2Member").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2Account").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2ApiKey").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2Project").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
              <li>
                {t("terms.article2Content").split('"').map((part, idx) => 
                  idx === 1 ? <strong key={idx} className="text-foreground">"{part}"</strong> : part
                )}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article3Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article3Item1")}</p>
              <p>{t("terms.article3Item2")}</p>
              <p>
                {t("terms.article3Item3")}
              </p>
              <p>
                {t("terms.article3Item4")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article4Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article4Item1")}
              </p>
              <p>{t("terms.article4Item2")}</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>{t("terms.article4Item2a")}</li>
                <li>{t("terms.article4Item2b")}</li>
                <li>{t("terms.article4Item2c")}</li>
              </ul>
              <p>{t("terms.article4Item3")}</p>
              <p>{t("terms.article4Item4")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article5Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article5Item1")}</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>{t("terms.article5Service1")}</li>
                <li>{t("terms.article5Service2")}</li>
                <li>{t("terms.article5Service3")}</li>
                <li>{t("terms.article5Service4")}</li>
                <li>{t("terms.article5Service5")}</li>
                <li>{t("terms.article5Service6")}</li>
                <li>{t("terms.article5Service7")}</li>
              </ul>
              <p>{t("terms.article5Item2")}</p>
              <p>{t("terms.article5Item3")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article6Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article6Item1")}
              </p>
              <p>
                {t("terms.article6Item2")}
              </p>
              <p>
                {t("terms.article6Item3")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article7Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article7Item1")}</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>{t("terms.article7Prohibited1")}</li>
                <li>{t("terms.article7Prohibited2")}</li>
                <li>{t("terms.article7Prohibited3")}</li>
                <li>{t("terms.article7Prohibited4")}</li>
                <li>{t("terms.article7Prohibited5")}</li>
                <li>{t("terms.article7Prohibited6")}</li>
                <li>{t("terms.article7Prohibited7")}</li>
                <li>{t("terms.article7Prohibited8")}</li>
                <li>{t("terms.article7Prohibited9")}</li>
                <li>{t("terms.article7Prohibited10")}</li>
                <li>{t("terms.article7Prohibited11")}</li>
              </ul>
              <p>
                {t("terms.article7Item2")}
              </p>
              <p>{t("terms.article7Item3")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article8Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article8Item1")}
              </p>
              <p>
                {t("terms.article8Item2")}
              </p>
              <p>
                {t("terms.article8Item3")}
              </p>
              <p>
                {t("terms.article8Item4")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article9Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article9Item1")}</p>
              <p>{t("terms.article9Item2")}</p>
              <p>{t("terms.article9Item3")}</p>
              <p>{t("terms.article9Item4")}</p>
              <p>{t("terms.article9Item5")}</p>
              <p>{t("terms.article9Item6")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article10Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article10Item1")}</p>
              <p>{t("terms.article10Item2")}</p>
              <p>{t("terms.article10Item3")}</p>
              <p>
                {t("terms.article10Item4")}
              </p>
              <p>{t("terms.article10Item5")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article11Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("terms.article11Content")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article12Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article12Item1")}
              </p>
              <p>{t("terms.article12Item2")}</p>
              <p>{t("terms.article12Item3")}</p>
              <p>{t("terms.article12Item4")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article13Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article13Item1")}
              </p>
              <p>
                {t("terms.article13Item2")}
              </p>
              <p>{t("terms.article13Item3")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article14Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article14Item1")}
              </p>
              <p>{t("terms.article14Item2")}</p>
              <p>
                {t("terms.article14Item3")}
              </p>
              <p>{t("terms.article14Item4")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article15Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {t("terms.article15Item1")}
              </p>
              <p>{t("terms.article15Item2")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("terms.article16Title")}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t("terms.article16Item1")}</p>
              <p>{t("terms.article16Item2")}</p>
              <p>{t("terms.article16Item3")}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            {t("terms.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

