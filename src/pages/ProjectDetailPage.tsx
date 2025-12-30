import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Globe, Languages, Settings, ArrowRight, Plus, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiKeyDisplay } from "@/components/project/ApiKeyDisplay";
import { ProjectStats } from "@/components/project/ProjectStats";
import { useProject, useProjectMembers } from "@/hooks/useProjects";
import { useLocales } from "@/hooks/useLocales";
import { useKeys } from "@/hooks/useKeys";
import { useTranslationMatrix } from "@/hooks/useTranslations";
import { MemberList } from "@/components/member";
import { useMemberPermissions } from "@/hooks/useMembers";
import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useProject(id!);
  const { data: locales, isLoading: isLocalesLoading } = useLocales(id!);
  const { data: keys, isLoading: isKeysLoading } = useKeys(id!);
  const { data: translationMatrix, isLoading: isMatrixLoading } =
    useTranslationMatrix(id!);
  const { data: projectMembers, isLoading: isMembersLoading } = useProjectMembers(id!);
  const { data: permissions } = useMemberPermissions();
  const { data: planInfo } = usePlan();
  
  const canManageMembers = permissions?.permissions.canManageMembers ?? false;
  // Free 플랜이 아닌 경우에만 멤버 섹션 표시
  const canSeeMembers = planInfo?.plan !== "FREE";

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
              <p className="text-lg font-semibold">
                {t("project.notFound")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("project.notFoundDescription")}
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
              <span>{t("project.overviewDescription")}</span>
              <Badge variant="secondary" className="text-xs">
                {project.defaultLocale}
              </Badge>
            </div>
          }
        />

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_LOCALES(id!)} className="cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">{t("project.localeManagement")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("project.localeManagementDescription")}
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_TRANSLATIONS(id!)} className="cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                    <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">{t("project.translationManagement")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("project.translationManagementDescription")}
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_SETTINGS(id!)} className="cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">{t("project.projectSettings")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("project.projectSettingsDescription")}
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_TRANSLATIONS(id!)} className="cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">{t("project.startTranslation")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("project.startTranslationDescription")}
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Stats */}
        <ProjectStats
          localesCount={stats.localesCount}
          keysCount={stats.keysCount}
          translationsCount={stats.translationsCount}
        />

        {/* Members - Free 플랜이 아닌 경우에만 표시 */}
        {canSeeMembers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("project.teamMembers")}
              </CardTitle>
              <CardDescription>
                {t("project.teamMembersDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMembersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : projectMembers && projectMembers.length > 0 ? (
                <MemberList 
                  members={projectMembers} 
                  canManage={!!(canManageMembers && project.isOwner)} 
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("project.noMembers")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Key */}
        <ApiKeyDisplay projectId={project.id} />
      </div>
    </AppLayout>
  );
}
