import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Lock } from "lucide-react";
import type { AxiosError } from "axios";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useMe, useChangePassword, useDeleteAccount } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { ROUTES } from "@/lib/constants";
import { PlanBadge } from "@/components/subscription/PlanBadge";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    newPassword: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();
  const { data: planInfo, isLoading: isLoadingPlan } = usePlan();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("비밀번호가 변경되었습니다");
          passwordForm.reset();
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message || "비밀번호 변경에 실패했습니다"
          );
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast.success("계정이 삭제되었습니다");
        navigate(ROUTES.HOME);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message || "계정 삭제에 실패했습니다"
        );
      },
    });
  };

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

  if (!user) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">
                사용자 정보를 불러올 수 없습니다
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="설정"
          description="계정 정보를 확인하거나 삭제할 수 있습니다"
        />

        {/* 계정 정보 (읽기 전용) */}
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>계정 정보를 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={user.name} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>이메일</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 구독 플랜 */}
        <Card>
          <CardHeader>
            <CardTitle>구독 플랜</CardTitle>
            <CardDescription>
              현재 플랜 정보를 확인하고 업그레이드할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPlan ? (
              <Skeleton className="h-20" />
            ) : planInfo ? (
              <>
                <div className="flex items-center gap-2">
                  <Label>현재 플랜:</Label>
                  <PlanBadge plan={planInfo.plan} />
                  {planInfo.plan === "FREE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = "/pricing")}
                    >
                      업그레이드
                    </Button>
                  )}
                </div>
                {planInfo.planStartedAt && (
                  <div className="text-sm text-muted-foreground">
                    플랜 시작일:{" "}
                    {new Date(planInfo.planStartedAt).toLocaleDateString(
                      "ko-KR"
                    )}
                  </div>
                )}
                {planInfo.planEndsAt && (
                  <div className="text-sm text-muted-foreground">
                    플랜 만료일:{" "}
                    {new Date(planInfo.planEndsAt).toLocaleDateString("ko-KR")}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                플랜 정보를 불러올 수 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle>비밀번호</CardTitle>
            <CardDescription>비밀번호를 변경할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="현재 비밀번호"
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder="새 비밀번호"
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  placeholder="새 비밀번호 확인"
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isChangingPassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* 위험 구역 */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">위험 구역</CardTitle>
            <CardDescription>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
              없습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeletingAccount}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeletingAccount ? "삭제 중..." : "계정 삭제"}
            </Button>
          </CardContent>
        </Card>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>계정 삭제 확인</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 계정을 삭제하시겠습니까?
                <br />
                <br />이 작업은 되돌릴 수 없으며, 다음 데이터가 영구적으로
                삭제됩니다:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>모든 프로젝트</li>
                  <li>모든 번역 데이터</li>
                  <li>계정 정보</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingAccount}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingAccount ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
