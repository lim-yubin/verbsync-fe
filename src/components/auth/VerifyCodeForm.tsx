import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useVerifyCode, useForgotPassword } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function VerifyCodeForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();
  const { mutate: resendCode, isPending: isResending } = useForgotPassword();
  const [countdown, setCountdown] = useState(0);

  const verifyCodeSchema = z.object({
    code: z.string().min(6, t("forgotPassword.codeRequired")),
  });

  type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  // 재전송 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = (data: VerifyCodeFormData) => {
    if (!email) {
      toast.error(t("forgotPassword.emailRequired"));
      navigate(ROUTES.FORGOT_PASSWORD);
      return;
    }

    verifyCode(
      { email, code: data.code },
      {
        onSuccess: (response) => {
          if (response.verified) {
            toast.success(t("forgotPassword.codeVerified"));
            navigate(
              `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&code=${encodeURIComponent(data.code)}`
            );
          } else {
            toast.error(t("forgotPassword.codeInvalid"));
          }
        },
        onError: (error: Error) => {
          console.error(error);
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message ||
              t("forgotPassword.verifyFailed")
          );
        },
      }
    );
  };

  const handleResend = () => {
    if (!email) {
      toast.error(t("forgotPassword.emailRequired"));
      return;
    }

    resendCode(
      { email },
      {
        onSuccess: () => {
          toast.success(t("forgotPassword.codeResent"));
          setCountdown(60); // 60초 카운트다운
        },
        onError: (error: Error) => {
          console.error(error);
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message ||
              t("forgotPassword.resendFailed")
          );
        },
      }
    );
  };

  if (!email) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-destructive">
            {t("forgotPassword.emailRequired")}
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
        <div className="mb-4 text-sm text-muted-foreground">
          {t("forgotPassword.codeSentTo")} <strong>{email}</strong>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("forgotPassword.verificationCode")}</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              maxLength={6}
              {...register("code")}
              disabled={isVerifying}
              className="text-center text-2xl tracking-widest"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isVerifying}
          >
            {isVerifying ? t("common.loading") : t("forgotPassword.verify")}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            {t("forgotPassword.didntReceiveCode")}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
          >
            {countdown > 0
              ? t("forgotPassword.resendIn", { seconds: countdown })
              : t("forgotPassword.resendCode")}
          </Button>
        </div>

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

