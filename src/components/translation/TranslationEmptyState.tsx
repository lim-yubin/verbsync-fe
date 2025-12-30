import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";

interface TranslationEmptyStateProps {
  type: "no-locales" | "no-keys";
  onAddLocale?: () => void;
}

export function TranslationEmptyState({
  type,
  onAddLocale,
}: TranslationEmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title={t("translationEmpty.title")}
          description={t("translationEmpty.description")}
        />
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">{t("translationEmpty.startTranslation")}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {type === "no-locales"
                ? t("translationEmpty.addLocaleFirst")
                : t("translationEmpty.addLocaleAndKeys")}
            </p>
            {onAddLocale && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={onAddLocale} className="cursor-pointer">
                  {t("translationEmpty.addLocale")}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

