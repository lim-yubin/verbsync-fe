import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberItem } from "./MemberItem";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { useMembers } from "@/hooks/useMembers";
import { usePlan } from "@/hooks/usePlan";
import type { ProjectMember } from "@/types/api";

interface MemberListProps {
  canManage: boolean; // 멤버 관리 권한 여부
  members?: ProjectMember[]; // 멤버 목록 (선택적, 없으면 useMembers 사용)
}

// 멤버 정렬 함수: Owner → Editor → Viewer, 그 다음 가입일순
function sortMembers(members: ProjectMember[]): ProjectMember[] {
  const roleOrder: Record<string, number> = {
    OWNER: 0,
    EDITOR: 1,
    VIEWER: 2,
  };

  return [...members].sort((a, b) => {
    // 역할 순서로 정렬
    const roleDiff = roleOrder[a.role] - roleOrder[b.role];
    if (roleDiff !== 0) return roleDiff;

    // 같은 역할이면 가입일순 (오래된 순)
    const dateA = new Date(a.joinedAt || a.invitedAt).getTime();
    const dateB = new Date(b.joinedAt || b.invitedAt).getTime();
    return dateA - dateB;
  });
}

export function MemberList({ canManage, members: propMembers }: MemberListProps) {
  const { t } = useTranslation();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: fetchedMembers, isLoading } = useMembers();
  const { data: planInfo } = usePlan();
  // 백엔드에서 이미 getEffectivePlan이 적용된 features 사용
  const canInviteMembers = planInfo?.features.canInviteMembers ?? false;
  
  // prop으로 전달된 members가 있으면 사용, 없으면 fetchedMembers 사용
  const members = propMembers ?? fetchedMembers;
  const isLoadingMembers = !propMembers && isLoading;

  // 멤버 정렬
  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return sortMembers(members);
  }, [members]);

  if (isLoadingMembers) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("memberList.noMembers")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("memberList.noMembersDescription")}
        </p>
        {canManage && (
          canInviteMembers ? (
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("memberList.invite")}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("memberList.invite")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("memberList.starterRequired")}{" "}
                <a href="/pricing" className="underline cursor-pointer">
                  {t("memberList.upgrade")}
                </a>
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("memberList.teamMembers")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("memberList.totalCount", { count: members.length })}
            </p>
          </div>
        {canManage && (
          canInviteMembers ? (
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("memberList.invite")}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("memberList.invite")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("memberList.starterRequired")}{" "}
                <a href="/pricing" className="underline cursor-pointer">
                  {t("memberList.upgrade")}
                </a>
              </TooltipContent>
            </Tooltip>
          )
        )}
        </div>

        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              canManage={canManage}
            />
          ))}
        </div>
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </>
  );
}

