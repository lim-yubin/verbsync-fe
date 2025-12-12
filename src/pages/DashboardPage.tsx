import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DashboardPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="프로젝트"
          description="내가 관리하는 번역 프로젝트"
          action={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 프로젝트
            </Button>
          }
        />

        {/* 프로젝트 목록 (Phase 2에서 구현) */}
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              프로젝트 카드 그리드가 여기에 표시됩니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Phase 2에서 구현 예정)
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

