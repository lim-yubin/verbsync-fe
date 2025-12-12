import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiKeyDisplay } from "@/components/project/ApiKeyDisplay";
import { ProjectStats } from "@/components/project/ProjectStats";
import { useProject } from "@/hooks/useProjects";
import { useLocales } from "@/hooks/useLocales";
import { useKeys } from "@/hooks/useKeys";
import { useTranslationMatrix } from "@/hooks/useTranslations";
import { Badge } from "@/components/ui/badge";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useProject(id!);
  const { data: locales, isLoading: isLocalesLoading } = useLocales(id!);
  const { data: keys, isLoading: isKeysLoading } = useKeys(id!);
  const { data: translationMatrix, isLoading: isMatrixLoading } =
    useTranslationMatrix(id!);

  // 통계 계산
  const stats = useMemo(() => {
    // 활성화된 언어 수
    const localesCount =
      locales?.filter((locale) => locale.isActive).length || 0;

    // 번역 키 수
    const keysCount = keys?.length || 0;

    // 작성된 번역 수 (비어있지 않은 번역 값의 개수)
    const translationsCount =
      translationMatrix?.rows.reduce((count, row) => {
        return (
          count +
          Object.values(row.translations).filter((value) => value.trim() !== "")
            .length
        );
      }, 0) || 0;

    return { localesCount, keysCount, translationsCount };
  }, [locales, keys, translationMatrix]);

  const isLoading =
    isProjectLoading || isLocalesLoading || isKeysLoading || isMatrixLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">프로젝트를 찾을 수 없습니다</p>
              <p className="text-sm text-muted-foreground mt-2">
                삭제되었거나 접근 권한이 없습니다
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <PageHeader
          title={project.name}
          description={
            <div className="flex items-center gap-2 mt-1">
              <span>프로젝트 개요 및 설정</span>
              <Badge variant="secondary" className="text-xs">
                {project.defaultLocale}
              </Badge>
            </div>
          }
        />

        {/* Stats */}
        <ProjectStats
          localesCount={stats.localesCount}
          keysCount={stats.keysCount}
          translationsCount={stats.translationsCount}
        />

        {/* API Key */}
        <ApiKeyDisplay apiKey={project.apiKey} />

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">시작하기</h3>
            <p className="text-sm text-muted-foreground mb-4">
              번역 키를 추가하고 언어를 설정하세요
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">1.</span>
                <span>언어 추가</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">2.</span>
                <span>번역 키 생성</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">3.</span>
                <span>번역 작성</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">개발자 가이드</h3>
            <p className="text-sm text-muted-foreground mb-4">
              API를 통해 번역 데이터를 가져오세요
            </p>
            <div className="rounded-md bg-muted p-3 font-mono text-xs">
              <p className="text-muted-foreground">
                // React i18next 예시
              </p>
              <p className="mt-1">
                fetch('https://api.verbasync.com/public/{"{apiKey}"}/locales/ko.json')
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

