import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteMember, useMembers, useMemberPermissions } from "@/hooks/useMembers";
import { usePlan } from "@/hooks/usePlan";
import { canInviteMember, getUpgradeMessage } from "@/lib/plans";
import { ROUTES } from "@/lib/constants";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: inviteMember, isPending } = useInviteMember();
  const { data: members } = useMembers();
  const { data: planInfo } = usePlan();
  const { data: permissions } = useMemberPermissions();
  const isOwner = permissions?.role === "OWNER";

  const inviteMemberSchema = z.object({
    email: z.string().min(1, t("auth.email")).email(t("auth.emailInvalid")),
    role: z.enum(["EDITOR", "VIEWER"] as const),
  });

  type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "EDITOR",
    },
  });

  // React Hook Form의 watch() 사용 (React Compiler 경고 무시)
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = watch("role");

  const onSubmit = (data: InviteMemberFormData) => {
    // 플랜 제한 체크
    if (planInfo && members) {
      // 소유자 포함하여 총 멤버 수 계산
      const currentMemberCount = members.length;
      // 백엔드에서 이미 getEffectivePlan이 적용된 plan 사용
      if (!canInviteMember(planInfo.plan, currentMemberCount)) {
        const limit =
          planInfo.plan === "FREE"
            ? 1
            : planInfo.plan === "STARTER"
            ? 3
            : Infinity;
        toast.error(t("member.memberLimitReached", { limit }), {
          description: getUpgradeMessage(t, planInfo.plan, "members", isOwner),
          action: isOwner
            ? {
                label: t("member.viewPlan"),
                onClick: () => {
                  navigate(ROUTES.PRICING);
                  onOpenChange(false);
                },
              }
            : undefined,
        });
        return;
      }
    }

    inviteMember(data, {
      onSuccess: () => {
        toast.success(t("member.inviteSuccess"));
        reset();
        onOpenChange(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || t("member.inviteFailed")
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("member.inviteTitle")}</DialogTitle>
          <DialogDescription>{t("member.inviteDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("member.emailRequired")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register("email")}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* 역할 */}
          <div className="space-y-2">
            <Label htmlFor="role">
              {t("member.roleRequired")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setValue("role", value as "EDITOR" | "VIEWER")
              }
              disabled={isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={t("member.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITOR">{t("member.editor")}</SelectItem>
                <SelectItem value="VIEWER">{t("member.viewer")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedRole === "EDITOR"
                ? t("member.editorDescription")
                : t("member.viewerDescription")}
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? t("member.inviting") : t("member.inviteButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
