import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberList } from "@/components/member";
import { useMemberPermissions } from "@/hooks/useMembers";

export function MembersPage() {
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
          title="팀 멤버"
          description="계정 멤버를 관리하고 권한을 설정할 수 있습니다. 멤버는 계정의 모든 프로젝트에 접근할 수 있습니다."
        />

        <MemberList canManage={canManage} />
      </div>
    </AppLayout>
  );
}

