import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AuthFooter } from "@/components/layout/AuthFooter";
import { ROUTES } from "@/lib/constants";
import { api } from "@/lib/api";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("인증 토큰이 없습니다.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post("/auth/verify-email", { token });
        setStatus("success");
        toast.success("이메일 인증이 완료되었습니다!");
        
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      } catch (error: unknown) {
        setStatus("error");
        const axiosError = error as { response?: { data?: { message?: string } } };
        setErrorMessage(
          axiosError.response?.data?.message || "이메일 인증에 실패했습니다."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

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
                {status === "loading" && (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                )}
                {status === "success" && (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                )}
                {status === "error" && (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <CardTitle>
                {status === "loading" && "이메일 인증 중..."}
                {status === "success" && "이메일 인증 완료"}
                {status === "error" && "이메일 인증 실패"}
              </CardTitle>
              <CardDescription>
                {status === "loading" && "잠시만 기다려주세요."}
                {status === "success" && "이메일 인증이 성공적으로 완료되었습니다."}
                {status === "error" && errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "success" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    로그인 페이지로 이동합니다...
                  </AlertDescription>
                </Alert>
              )}

              {status === "error" && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(ROUTES.LOGIN)}
                      className="w-full"
                    >
                      로그인 페이지로 이동
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.REGISTER)}
                      className="w-full"
                    >
                      회원가입 페이지로 이동
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

