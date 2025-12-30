import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocales } from "@/hooks/useLocales";
import { useProject } from "@/hooks/useProjects";
import { LocaleItem, AddLocaleDialog } from "@/components/locale";

export function LocalesPage() {
  const { t } = useTranslation();
  const { id: projectId } = useParams<{ id: string }>();
  const { data: locales, isLoading } = useLocales(projectId!);
  const { data: project } = useProject(projectId!);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 편집 권한 확인 (OWNER 또는 EDITOR만 편집 가능, VIEWER는 조회만)
  const canEdit = project?.isOwner || project?.role === "EDITOR";

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title={t("locale.title")}
          description={t("locale.description")}
          action={
            canEdit && (
              <Button onClick={() => setDialogOpen(true)} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                {t("locale.addLocale")}
              </Button>
            )
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : !locales || locales.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("locale.noLocalesDescription")}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {locales.map((locale) => (
              <LocaleItem
                key={locale.id}
                locale={locale}
                projectId={projectId!}
                isDefault={locale.code === project?.defaultLocale}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* 언어 추가 다이얼로그 */}
      <AddLocaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId!}
        existingLocales={locales || []}
      />
    </AppLayout>
  );
}
