import { useState } from "react";
import { Trash2, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
import { ROLE_LABELS } from "@/lib/permissions";
import { useAuthStore } from "@/store/authStore";

interface MemberItemProps {
  member: ProjectMember;
  canManage: boolean; // 멤버 관리 권한 여부
}

export function MemberItem({
  member,
  canManage,
}: MemberItemProps) {
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
          toast.success("멤버 역할이 변경되었습니다");
          setRoleChangeDialogOpen(false);
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "역할 변경에 실패했습니다"
          );
        },
      }
    );
  };

  const handleRemove = () => {
    removeMember(member.id, {
      onSuccess: () => {
        toast.success("멤버가 제거되었습니다");
        setRemoveDialogOpen(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "멤버 제거에 실패했습니다"
        );
      },
    });
  };

  const displayName = member.user?.name || member.user?.email || "알 수 없음";
  const displayEmail = member.user?.email || "이메일 없음";
  const dateLabel = isPending ? "초대일" : "가입일";
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
                  <span className="text-xs text-muted-foreground">(나)</span>
                )}
                <RoleBadge role={member.role} />
                {isPending && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    초대 대기 중
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {displayEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dateLabel}: {format(new Date(dateValue), "yyyy년 M월 d일", { locale: ko })}
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
                      <SelectItem value="EDITOR">{ROLE_LABELS.EDITOR}</SelectItem>
                      <SelectItem value="VIEWER">{ROLE_LABELS.VIEWER}</SelectItem>
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
              역할 변경 불가
            </div>
          )}
        </div>
      </Card>

      {/* 역할 변경 확인 다이얼로그 */}
      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 역할 변경</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{displayName}</span>의 역할을{" "}
              <span className="font-semibold">{ROLE_LABELS[member.role]}</span>
              에서{" "}
              <span className="font-semibold">{ROLE_LABELS[selectedRole]}</span>
              로 변경하시겠습니까?
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
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isUpdatingRole}
            >
              {isUpdatingRole ? "변경 중..." : "변경"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 제거 확인 다이얼로그 */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 제거 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{displayName}</span>을(를) 프로젝트에서
              제거하시겠습니까?
              <br />
              <br />
              이 작업은 되돌릴 수 없으며, 해당 멤버는 더 이상 프로젝트에 접근할 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "제거 중..." : "제거"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

