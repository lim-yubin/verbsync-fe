import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Folder className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">프로젝트가 없습니다</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        첫 번째 번역 프로젝트를 만들어 다국어 관리를 시작하세요
      </p>
      <Button onClick={onCreateProject} className="mt-6">
        <Plus className="mr-2 h-4 w-4" />
        새 프로젝트 만들기
      </Button>
    </div>
  );
}

