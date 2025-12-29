import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AuthFooter } from "@/components/layout/AuthFooter";
import { ROUTES } from "@/lib/constants";
import { api } from "@/lib/api";

export function EmailVerificationPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("이메일 주소를 찾을 수 없습니다.");
      return;
    }

    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success("인증 이메일이 재발송되었습니다.");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "이메일 재발송에 실패했습니다."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 justify-center cursor-pointer"
            >
              <Logo width={32} height={32} />
              <h1 className="text-2xl font-bold text-foreground">Verbsync</h1>
            </a>
          </div>

          <Card className="w-full border shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>이메일 인증이 필요합니다</CardTitle>
              <CardDescription>
                회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">{email}</strong>로
                </p>
                <p className="text-sm text-muted-foreground">
                  인증 이메일을 발송했습니다.
                </p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>이메일을 확인하고 인증 링크를 클릭해주세요.</p>
                <p className="text-xs">
                  • 이메일이 보이지 않는다면 스팸 폴더를 확인해주세요.
                  <br />
                  • 인증 링크는 24시간 동안 유효합니다.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      인증 이메일 재발송
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  variant="ghost"
                  className="w-full"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

