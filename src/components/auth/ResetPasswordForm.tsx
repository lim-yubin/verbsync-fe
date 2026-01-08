import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useResetPassword } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  const { mutate: resetPassword, isPending } = useResetPassword();

  const resetPasswordSchema = z
    .object({
      newPassword: z.string().min(6, t("auth.passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!email || !code) {
      toast.error(t("forgotPassword.invalidLink"));
      navigate(ROUTES.FORGOT_PASSWORD);
      return;
    }

    resetPassword(
      { email, code, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success(t("forgotPassword.passwordResetSuccess"));
          navigate(ROUTES.LOGIN);
        },
        onError: (error: Error) => {
          console.error(error);
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message ||
              t("forgotPassword.resetFailed")
          );
        },
      }
    );
  };

  if (!email || !code) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-destructive">
            {t("forgotPassword.invalidLink")}
          </div>
          <div className="mt-4 text-center">
            <a
              href={ROUTES.FORGOT_PASSWORD}
              className="text-foreground font-medium hover:underline cursor-pointer"
            >
              {t("forgotPassword.backToForgotPassword")}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("forgotPassword.newPassword")}</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••"
              {...register("newPassword")}
              disabled={isPending}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("forgotPassword.confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              {...register("confirmPassword")}
              disabled={isPending}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {t("forgotPassword.passwordRequirements")}
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("common.loading") : t("forgotPassword.resetPassword")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a
            href={ROUTES.LOGIN}
            className="text-foreground font-medium hover:underline cursor-pointer"
          >
            {t("forgotPassword.backToLogin")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

