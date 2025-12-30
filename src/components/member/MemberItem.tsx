import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RoleBadge } from "./RoleBadge";
import {
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useMembers";
import type { ProjectMember } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

interface MemberItemProps {
  member: ProjectMember;
  canManage: boolean; // 멤버 관리 권한 여부
}

export function MemberItem({
  member,
  canManage,
}: MemberItemProps) {
  const { t, i18n } = useTranslation();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isCurrentUser = member.userId === currentUserId;
  const isOwner = member.role === "OWNER";
  const isPending = member.status === "PENDING";

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"EDITOR" | "VIEWER">(
    member.role === "OWNER" ? "EDITOR" : (member.role as "EDITOR" | "VIEWER")
  );

  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateMemberRole();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMember();

  const handleRoleChange = () => {
    if (selectedRole === member.role) {
      setRoleChangeDialogOpen(false);
      return;
    }

    updateRole(
      {
        memberId: member.id,
        dto: { role: selectedRole },
      },
      {
        onSuccess: () => {
          toast.success(t("member.roleChangeSuccess"));
          setRoleChangeDialogOpen(false);
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || t("member.roleChangeFailed")
          );
        },
      }
    );
  };

  const handleRemove = () => {
    removeMember(member.id, {
      onSuccess: () => {
        toast.success(t("member.removeSuccess"));
        setRemoveDialogOpen(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || t("member.removeFailed")
        );
      },
    });
  };

  const displayName = member.user?.name || member.user?.email || t("common.unknown");
  const displayEmail = member.user?.email || t("common.noEmail");
  const dateLabel = isPending ? t("member.inviteDate") : t("member.joinDate");
  const dateValue = isPending ? member.invitedAt : member.joinedAt || member.invitedAt;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {isPending ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{displayName}</span>
                {isCurrentUser && (
                  <span className="text-xs text-muted-foreground">({t("common.me")})</span>
                )}
                <RoleBadge role={member.role} />
                {isPending && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {t("member.pendingInvite")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {displayEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dateLabel}: {format(
                  new Date(dateValue),
                  i18n.language === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy",
                  { locale: i18n.language === "ko" ? ko : enUS }
                )}
              </p>
            </div>
          </div>

          {canManage && !isCurrentUser && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isOwner && (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(value) => {
                      if (value !== member.role) {
                        setSelectedRole(value as "EDITOR" | "VIEWER");
                        setRoleChangeDialogOpen(true);
                      }
                    }}
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger className="w-32 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EDITOR">{t("member.editor")}</SelectItem>
                      <SelectItem value="VIEWER">{t("member.viewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRemoveDialogOpen(true)}
                disabled={isRemoving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isOwner && canManage && (
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {t("member.roleChangeNotAllowed")}
            </div>
          )}
        </div>
      </Card>

      {/* 역할 변경 확인 다이얼로그 */}
      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("member.roleChangeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("member.roleChangeDescription", {
                name: displayName,
                from: t(`member.${member.role.toLowerCase()}`),
                to: t(`member.${selectedRole.toLowerCase()}`),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isUpdatingRole}
              onClick={() => {
                // 취소 시 원래 역할로 되돌리기
                setSelectedRole(
                  member.role === "OWNER" ? "EDITOR" : (member.role as "EDITOR" | "VIEWER")
                );
              }}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isUpdatingRole}
              className="cursor-pointer"
            >
              {isUpdatingRole ? t("member.changing") : t("member.change")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 제거 확인 다이얼로그 */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("member.removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("member.removeDescription", { name: displayName })}
              <br />
              <br />
              {t("member.removeWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isRemoving ? t("member.removing") : t("member.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

