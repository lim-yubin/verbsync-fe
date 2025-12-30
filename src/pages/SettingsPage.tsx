import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2, Lock } from "lucide-react";
import type { AxiosError } from "axios";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
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
import { PlanBadge } from "@/components/subscription/PlanBadge";

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();
  const { data: planInfo, isLoading: isLoadingPlan } = usePlan();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(6, t("auth.passwordMinLength")),
      newPassword: z.string().min(6, t("auth.passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.passwordMismatch"),
      path: ["confirmPassword"],
    });

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
          toast.success(t("settings.passwordChanged"));
          passwordForm.reset();
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message || t("settings.passwordChangeFailed")
          );
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast.success(t("settings.accountDeleted"));
        navigate(ROUTES.HOME);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message || t("settings.accountDeleteFailed")
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
                {t("settings.userInfoError")}
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
          title={t("settings.title")}
          description={t("settings.description")}
        />

        {/* 계정 정보 (읽기 전용) */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.accountInfo")}</CardTitle>
            <CardDescription>{t("settings.accountInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("auth.name")}</Label>
              <Input value={user.name} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>{t("auth.email")}</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 구독 플랜 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.subscriptionPlan")}</CardTitle>
            <CardDescription>
              {t("settings.subscriptionPlanDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPlan ? (
              <Skeleton className="h-20" />
            ) : planInfo ? (
              <>
                <div className="flex items-center gap-2">
                  <Label>{t("settings.currentPlan")}</Label>
                  <PlanBadge plan={planInfo.plan} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = ROUTES.SUBSCRIPTION)}
                    className="cursor-pointer"
                  >
                    {t("settings.planManagement")}
                  </Button>
                </div>
                {planInfo.planStartedAt && (
                  <div className="text-sm text-muted-foreground">
                    {t("settings.planStartDate")}{" "}
                    {new Date(planInfo.planStartedAt).toLocaleDateString(
                      "ko-KR"
                    )}
                  </div>
                )}
                {planInfo.planEndsAt && (
                  <div className="text-sm text-muted-foreground">
                    {t("settings.planEndDate")}{" "}
                    {new Date(planInfo.planEndsAt).toLocaleDateString("ko-KR")}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("settings.planInfoError")}
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.password")}</CardTitle>
            <CardDescription>{t("settings.passwordDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder={t("settings.currentPassword")}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder={t("settings.newPassword")}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  placeholder={t("settings.confirmPassword")}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isChangingPassword} className="cursor-pointer">
                  <Lock className="mr-2 h-4 w-4" />
                  {isChangingPassword ? t("settings.changingPassword") : t("settings.changePassword")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* 위험 구역 */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("settings.dangerZone")}</CardTitle>
            <CardDescription>
              {t("settings.dangerZoneDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeletingAccount}
              className="cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeletingAccount ? t("settings.deletingAccount") : t("settings.deleteAccount")}
            </Button>
          </CardContent>
        </Card>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.deleteAccountConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.deleteAccountConfirmDescription")}
                <br />
                <br />{t("settings.deleteAccountWarning")}
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t("settings.deleteAccountItems")}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingAccount}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                {isDeletingAccount ? t("settings.deletingAccount") : t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
