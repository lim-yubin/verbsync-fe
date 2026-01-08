import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForgotPassword } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("auth.email")),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        toast.success(t("forgotPassword.emailSent"));
        navigate(`${ROUTES.VERIFY_CODE}?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error: Error) => {
        console.error(error);
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message ||
            t("forgotPassword.sendFailed")
        );
      },
    });
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {t("forgotPassword.description")}
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("common.loading") : t("forgotPassword.sendCode")}
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

