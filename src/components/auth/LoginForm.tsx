import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: login, isPending } = useLogin();

  // URL 파라미터에서 이메일과 초대 토큰 가져오기
  const emailParam = searchParams.get("email");
  const inviteToken = searchParams.get("inviteToken");

  const loginSchema = z.object({
    email: z.string().email(t("auth.email")),
    password: z.string().min(6, t("auth.password")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam || "",
    },
  });

  // 이메일 파라미터가 있으면 폼에 설정
  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        toast.success(t("auth.login") + " " + t("common.success"));
        // 초대 토큰이 있으면 초대 수락 페이지로 이동
        if (inviteToken) {
          navigate(`${ROUTES.ACCEPT_INVITE}?token=${inviteToken}`);
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      },
      onError: (error: Error) => {
        console.error(error);
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message ||
            t("auth.login") + " " + t("common.error")
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

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              {...register("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("common.loading") : t("auth.login")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth.dontHaveAccount")}{" "}
          </span>
          <Link
            to={ROUTES.REGISTER}
            className="text-foreground font-medium hover:underline cursor-pointer"
          >
            {t("auth.register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
