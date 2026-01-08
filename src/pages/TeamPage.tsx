import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberList } from "@/components/member";
import { useMembers } from "@/hooks/useMembers";

export function TeamPage() {
  const { t } = useTranslation();
  const { isLoading: isMembersLoading } = useMembers();

  const isLoading = isMembersLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("team.title")}
          description={t("team.description")}
        />

        <MemberList canManage={false} />
      </div>
    </AppLayout>
  );
}

