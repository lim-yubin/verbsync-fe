import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { useInviteMember } from "@/hooks/useMembers";
import { ROLE_LABELS } from "@/lib/permissions";

const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  role: z.enum(["EDITOR", "VIEWER"] as const),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { mutate: inviteMember, isPending } = useInviteMember();

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

  const selectedRole = watch("role");

  const onSubmit = (data: InviteMemberFormData) => {
    inviteMember(data, {
      onSuccess: () => {
        toast.success("멤버 초대 이메일이 발송되었습니다");
        reset();
        onOpenChange(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "멤버 초대에 실패했습니다"
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>멤버 초대</DialogTitle>
          <DialogDescription>
            이메일 주소로 팀 멤버를 초대하세요. 초대 이메일이 발송됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">
              이메일 <span className="text-destructive">*</span>
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
              역할 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setValue("role", value as "EDITOR" | "VIEWER")
              }
              disabled={isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="역할을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITOR">{ROLE_LABELS.EDITOR}</SelectItem>
                <SelectItem value="VIEWER">{ROLE_LABELS.VIEWER}</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedRole === "EDITOR"
                ? "편집자: 번역 편집, 키/언어 추가/수정 가능"
                : "조회자: 읽기 전용"}
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
              취소
            </Button>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? "초대 중..." : "초대하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

