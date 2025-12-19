import { useState } from "react";
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
  const { id: projectId } = useParams<{ id: string }>();
  const { data: locales, isLoading } = useLocales(projectId!);
  const { data: project } = useProject(projectId!);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="언어 관리"
          description="프로젝트에서 지원하는 언어를 관리하세요"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              언어 추가
            </Button>
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
                아직 추가된 언어가 없습니다
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
