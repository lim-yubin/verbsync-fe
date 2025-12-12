import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        toast.success("로그인 성공!");
        navigate(ROUTES.DASHBOARD);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "로그인에 실패했습니다");
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          Verbasync 계정으로 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              {...register("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{" "}
          </span>
          <a
            href={ROUTES.REGISTER}
            className="text-gray-900 dark:text-gray-100 font-medium hover:underline"
          >
            회원가입
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

