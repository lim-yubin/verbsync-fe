import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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

const registerSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  passwordConfirm: z.string(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해야 합니다",
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "개인정보처리방침에 동의해야 합니다",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["passwordConfirm"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: register, isPending } = useRegister();

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
    const { passwordConfirm, agreedToTerms, agreedToPrivacy, ...registerData } = data;
    
    register(
      {
        ...registerData,
        agreedToTerms,
        agreedToPrivacy,
      },
      {
        onSuccess: () => {
          toast.success("회원가입 성공! 환영합니다 🎉");
          // 초대 토큰이 있으면 초대 수락 페이지로 이동
          if (inviteToken) {
            navigate(`${ROUTES.ACCEPT_INVITE}?token=${inviteToken}`);
          } else {
            navigate(ROUTES.DASHBOARD);
          }
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "회원가입에 실패했습니다");
        },
      }
    );
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              {...registerField("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
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
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              {...registerField("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="••••••"
              {...registerField("passwordConfirm")}
              disabled={isPending}
            />
            {errors.passwordConfirm && (
              <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setValue("agreedToTerms", checked === true)}
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
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    이용약관
                  </Link>
                  에 동의합니다 (필수)
                </Label>
              </div>
              {errors.agreedToTerms && (
                <p className="text-sm text-destructive ml-6">{errors.agreedToTerms.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToPrivacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) => setValue("agreedToPrivacy", checked === true)}
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
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    개인정보처리방침
                  </Link>
                  에 동의합니다 (필수)
                </Label>
              </div>
              {errors.agreedToPrivacy && (
                <p className="text-sm text-destructive ml-6">{errors.agreedToPrivacy.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            이미 계정이 있으신가요?{" "}
          </span>
          <Link
            to={ROUTES.LOGIN}
            className="text-foreground font-medium hover:underline cursor-pointer"
          >
            로그인
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

