import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberList } from "@/components/member";
import { useMemberPermissions } from "@/hooks/useMembers";

export function MembersPage() {
  const { t } = useTranslation();
  const { data: permissions, isLoading: isPermissionsLoading } =
    useMemberPermissions();

  const isLoading = isPermissionsLoading;
  const canManage = permissions?.permissions.canManageMembers ?? false;

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
          title={t("member.teamMembers")}
          description={t("member.teamMembersDescription")}
        />

        <MemberList canManage={canManage} />
      </div>
    </AppLayout>
  );
}

