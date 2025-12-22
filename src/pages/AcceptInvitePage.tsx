import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useGetInviteInfo, useAcceptInvite } from "@/hooks/useMembers";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, User } from "lucide-react";
import { toast } from "sonner";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const userEmail = useAuthStore((state) => state.user?.email);

  const { data: inviteInfo, isLoading, error } = useGetInviteInfo(token || "");
  const acceptInvite = useAcceptInvite();

  // 토큰이 없으면 에러
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              유효하지 않은 초대 링크
            </CardTitle>
            <CardDescription>
              초대 링크가 올바르지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to={ROUTES.LOGIN}>로그인 페이지로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">초대 정보를 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 처리
  if (error || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              초대 정보를 불러올 수 없습니다
            </CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "유효하지 않은 초대 링크이거나 이미 만료되었습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to={ROUTES.LOGIN}>로그인 페이지로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 이메일 불일치 체크 (로그인한 경우)
  const emailMismatch = isAuthenticated && userEmail !== inviteInfo.email;

  // 초대 수락 핸들러
  const handleAcceptInvite = async () => {
    if (!isAuthenticated) {
      // 로그인하지 않은 경우, 로그인 페이지로 이동 (이메일 파라미터 포함)
      navigate(`${ROUTES.LOGIN}?email=${encodeURIComponent(inviteInfo.email)}&inviteToken=${token}`);
      return;
    }

    if (emailMismatch) {
      toast.error("초대된 이메일과 로그인한 계정의 이메일이 일치하지 않습니다.");
      return;
    }

    try {
      await acceptInvite.mutateAsync(token);
      toast.success("초대를 수락했습니다!");
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "초대 수락에 실패했습니다."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verbsync 초대
          </CardTitle>
          <CardDescription>
            {inviteInfo.accountOwner.name}님이 Verbsync 계정에 초대했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 초대 정보 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">초대된 이메일</span>
              <span className="text-sm font-medium">{inviteInfo.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">역할</span>
              <Badge variant={inviteInfo.role === "EDITOR" ? "default" : "secondary"}>
                {inviteInfo.role === "EDITOR" ? "편집자" : "조회자"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">계정 소유자</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{inviteInfo.accountOwner.name}</span>
              </div>
            </div>
          </div>

          {/* 이메일 불일치 경고 */}
          {emailMismatch && (
            <Alert variant="destructive">
              <AlertDescription>
                초대된 이메일({inviteInfo.email})과 로그인한 계정의 이메일({userEmail})이
                일치하지 않습니다. 올바른 계정으로 로그인해주세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 회원가입 안 한 경우 안내 */}
          {!inviteInfo.isUserRegistered && !isAuthenticated && (
            <Alert>
              <AlertDescription>
                회원가입이 필요합니다. 회원가입 후 초대를 수락할 수 있습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 버튼 */}
          <div className="space-y-2">
            {!isAuthenticated ? (
              <>
                {inviteInfo.isUserRegistered ? (
                  <Button onClick={handleAcceptInvite} className="w-full" size="lg">
                    로그인하고 수락하기
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                      size="lg"
                    >
                      <Link to={`${ROUTES.REGISTER}?email=${encodeURIComponent(inviteInfo.email)}&inviteToken=${token}`}>
                        회원가입하고 수락하기
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full"
                    >
                      <Link to={`${ROUTES.LOGIN}?email=${encodeURIComponent(inviteInfo.email)}&inviteToken=${token}`}>
                        이미 계정이 있으신가요? 로그인
                      </Link>
                    </Button>
                  </>
                )}
              </>
            ) : emailMismatch ? (
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link to={ROUTES.LOGIN}>올바른 계정으로 로그인</Link>
              </Button>
            ) : (
              <Button
                onClick={handleAcceptInvite}
                className="w-full"
                size="lg"
                disabled={acceptInvite.isPending}
              >
                {acceptInvite.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    수락 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    초대 수락하기
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

