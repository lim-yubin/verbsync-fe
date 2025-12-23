import { useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/project/EmptyState";
import { ProjectCreateDialog } from "@/components/project/ProjectCreateDialog";
import { useProjects } from "@/hooks/useProjects";
import { usePlan } from "@/hooks/usePlan";

export function DashboardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const { data: planInfo } = usePlan();

  // 소유한 프로젝트와 팀 프로젝트 구분
  const ownedProjects = projects?.filter((p) => p.isOwner) || [];
  const teamProjects = projects?.filter((p) => !p.isOwner) || [];
  const hasOwnedProjects = ownedProjects.length > 0;
  const hasTeamProjects = teamProjects.length > 0;

  // 설명 텍스트 결정
  const description =
    hasOwnedProjects && hasTeamProjects
      ? "내가 관리하는 프로젝트와 팀이 관리하는 프로젝트"
      : hasOwnedProjects
      ? "내가 관리하는 번역 프로젝트"
      : hasTeamProjects
      ? "팀이 관리하는 번역 프로젝트"
      : "번역 프로젝트";

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Free 플랜 업그레이드 배너 */}
        {planInfo && planInfo.plan === "FREE" && (
          <Alert className="mb-6">
            <AlertDescription>
              Starter 플랜으로 업그레이드하여 더 많은 프로젝트와 기능을
              사용하세요.{" "}
              <a href="/pricing" className="font-semibold underline">
                자세히 보기
              </a>
            </AlertDescription>
          </Alert>
        )}

        <PageHeader
          title="프로젝트"
          description={description}
          action={
            <Button
              className="w-full sm:w-auto"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              새 프로젝트
            </Button>
          }
        />

        {/* 프로젝트 목록 */}
        {isLoading ? (
          <ProjectsLoadingSkeleton />
        ) : !projects || projects.length === 0 ? (
          <EmptyState onCreateProject={() => setCreateDialogOpen(true)} />
        ) : (
          <div className="space-y-6">
            {/* 내가 소유한 프로젝트 */}
            {hasOwnedProjects && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">내가 관리하는 프로젝트</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ownedProjects.length}개의 프로젝트
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ownedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      defaultLocale={project.defaultLocale}
                      createdAt={project.createdAt}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 팀 프로젝트 */}
            {hasTeamProjects && (
              <div className="space-y-4">
                {hasOwnedProjects && <div className="border-t pt-6" />}
                <div>
                  <h2 className="text-lg font-semibold">팀이 관리하는 프로젝트</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {teamProjects.length}개의 프로젝트
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {teamProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      defaultLocale={project.defaultLocale}
                      createdAt={project.createdAt}
                      role={project.role}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 프로젝트 생성 다이얼로그 */}
      <ProjectCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </AppLayout>
  );
}

// 로딩 스켈레톤
function ProjectsLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[180px] rounded-lg" />
      ))}
    </div>
  );
}

