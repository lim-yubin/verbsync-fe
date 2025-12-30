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
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
};

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: register, isPending } = useRegister();

  const registerSchema = z
    .object({
      name: z.string().min(2, t("auth.nameMinLength")),
      email: z.string().email(t("auth.emailInvalid")),
      password: z.string().min(6, t("auth.passwordMinLength")),
      passwordConfirm: z.string(),
      agreedToTerms: z.boolean().refine((val) => val === true, {
        message: t("auth.agreeToTerms"),
      }),
      agreedToPrivacy: z.boolean().refine((val) => val === true, {
        message: t("auth.agreeToPrivacy"),
      }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("auth.passwordMismatch"),
      path: ["passwordConfirm"],
    });

  // URL 파라미터에서 이메일과 초대 토큰 가져오기
  const emailParam = searchParams.get("email");
  const inviteToken = searchParams.get("inviteToken");

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: emailParam || "",
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  });

  const agreedToTerms = watch("agreedToTerms");
  const agreedToPrivacy = watch("agreedToPrivacy");

  // 이메일 파라미터가 있으면 폼에 설정
  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, agreedToTerms, agreedToPrivacy, ...registerData } =
      data;

    register(
      {
        ...registerData,
        agreedToTerms,
        agreedToPrivacy,
      },
      {
        onSuccess: (response) => {
          if (response.requiresEmailVerification) {
            // 이메일 인증이 필요한 경우
            toast.success(t("auth.registerSuccess"));
            navigate(
              `/email-verification-pending?email=${encodeURIComponent(
                data.email
              )}`
            );
          } else {
            // 이메일 인증이 필요 없는 경우 (개발 환경 등)
            toast.success(t("auth.registerSuccessNoVerification"));
            // 초대 토큰이 있으면 초대 수락 페이지로 이동
            if (inviteToken) {
              navigate(`${ROUTES.ACCEPT_INVITE}?token=${inviteToken}`);
            } else {
              navigate(ROUTES.DASHBOARD);
            }
          }
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message || t("auth.registerFailed")
          );
        },
      }
    );
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("auth.namePlaceholder")}
              {...registerField("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...registerField("email")}
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
              {...registerField("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">{t("auth.passwordConfirm")}</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="••••••"
              {...registerField("passwordConfirm")}
              disabled={isPending}
            />
            {errors.passwordConfirm && (
              <p className="text-sm text-destructive">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setValue("agreedToTerms", checked === true)
                  }
                  disabled={isPending}
                  className="mt-1"
                />
                <Label
                  htmlFor="agreedToTerms"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  <Link
                    to={ROUTES.TERMS}
                    target="_blank"
                    className="text-primary hover:underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("auth.terms")}
                  </Link>
                  {t("auth.agreeTerms")}
                </Label>
              </div>
              {errors.agreedToTerms && (
                <p className="text-sm text-destructive ml-6">
                  {errors.agreedToTerms.message}
                </p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToPrivacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    setValue("agreedToPrivacy", checked === true)
                  }
                  disabled={isPending}
                  className="mt-1"
                />
                <Label
                  htmlFor="agreedToPrivacy"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  <Link
                    to={ROUTES.PRIVACY}
                    target="_blank"
                    className="text-primary hover:underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("auth.privacy")}
                  </Link>
                  {t("auth.agreePrivacy")}
                </Label>
              </div>
              {errors.agreedToPrivacy && (
                <p className="text-sm text-destructive ml-6">
                  {errors.agreedToPrivacy.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("auth.registering") : t("auth.register")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth.alreadyHaveAccount")}{" "}
          </span>
          <Link
            to={ROUTES.LOGIN}
            className="text-foreground font-medium hover:underline cursor-pointer"
          >
            {t("auth.login")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
