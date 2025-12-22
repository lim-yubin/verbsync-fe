import { useParams, Link } from "react-router-dom";
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
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useProject(id!);
  const { data: locales, isLoading: isLocalesLoading } = useLocales(id!);
  const { data: keys, isLoading: isKeysLoading } = useKeys(id!);
  const { data: translationMatrix, isLoading: isMatrixLoading } =
    useTranslationMatrix(id!);
  const { data: projectMembers, isLoading: isMembersLoading } = useProjectMembers(id!);
  const { data: permissions } = useMemberPermissions();
  
  const canManageMembers = permissions?.permissions.canManageMembers ?? false;

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
                프로젝트를 찾을 수 없습니다
              </p>
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

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_LOCALES(id!)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">언어 관리</CardTitle>
                <CardDescription className="text-xs">
                  언어를 추가하고 활성화하세요
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_TRANSLATIONS(id!)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                    <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">번역 관리</CardTitle>
                <CardDescription className="text-xs">
                  번역을 작성하고 편집하세요
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_SETTINGS(id!)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">프로젝트 설정</CardTitle>
                <CardDescription className="text-xs">
                  프로젝트 정보와 보안 설정
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors">
            <Link to={ROUTES.PROJECT_TRANSLATIONS(id!)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-4">번역 시작하기</CardTitle>
                <CardDescription className="text-xs">
                  번역 키를 추가하고 번역을 작성하세요
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

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              팀 멤버
            </CardTitle>
            <CardDescription>
              이 프로젝트에 접근할 수 있는 팀 멤버 목록입니다
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
                <p>멤버가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key */}
        <ApiKeyDisplay projectId={project.id} />
      </div>
    </AppLayout>
  );
}
