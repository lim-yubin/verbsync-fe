import { useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/project/EmptyState";
import { ProjectCreateDialog } from "@/components/project/ProjectCreateDialog";
import { useProjects } from "@/hooks/useProjects";

export function DashboardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <PageHeader
          title="프로젝트"
          description="내가 관리하는 번역 프로젝트"
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                defaultLocale={project.defaultLocale}
                createdAt={project.createdAt}
              />
            ))}
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

