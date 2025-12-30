import { useTranslation } from "react-i18next";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Folder className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{t("emptyState.noProjects")}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {t("emptyState.noProjectsDescription")}
      </p>
      <Button onClick={onCreateProject} className="mt-6 cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        {t("emptyState.createProject")}
      </Button>
    </div>
  );
}

