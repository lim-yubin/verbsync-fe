import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
              {t("invite.invalidLink")}
            </CardTitle>
            <CardDescription>
              {t("invite.invalidLinkDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full cursor-pointer">
              <Link to={ROUTES.LOGIN}>{t("invite.goToLogin")}</Link>
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
              <p className="text-sm text-muted-foreground">{t("invite.loading")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 처리 (토큰이 있고 로딩이 완료되었지만 에러가 발생한 경우)
  if (token && !isLoading && (error || !inviteInfo)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {t("invite.loadError")}
            </CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : t("invite.loadErrorDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full cursor-pointer">
              <Link to={ROUTES.LOGIN}>{t("invite.goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // inviteInfo가 없으면 로딩 중이거나 토큰이 없는 경우이므로 위에서 처리됨
  // 하지만 명시적으로 로딩 상태를 표시하여 리다이렉트 방지
  if (!inviteInfo && !error && !isLoading) {
    // 토큰이 있지만 inviteInfo가 없고 에러도 없고 로딩도 완료된 경우
    // 이는 이상한 상태이므로 에러로 처리
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {t("invite.loadError")}
            </CardTitle>
            <CardDescription>
              {t("invite.loadErrorDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full cursor-pointer">
              <Link to={ROUTES.LOGIN}>{t("invite.goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // inviteInfo가 없으면 렌더링하지 않음 (에러는 위에서 처리됨)
  if (!inviteInfo) {
    // 로딩 중이거나 에러가 있는 경우는 위에서 처리됨
    // 이 경우는 방어적 코드로 null 반환 (실제로는 도달하지 않아야 함)
    return null;
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
      toast.error(t("invite.emailMismatch"));
      return;
    }

    try {
      await acceptInvite.mutateAsync(token);
      toast.success(t("invite.acceptSuccess"));
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("invite.acceptFailed")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("invite.title")}
          </CardTitle>
          <CardDescription>
            {inviteInfo.accountOwner.name}{t("invite.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 초대 정보 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("invite.invitedEmail")}</span>
              <span className="text-sm font-medium">{inviteInfo.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("member.role")}</span>
              <Badge variant={inviteInfo.role === "EDITOR" ? "default" : "secondary"}>
                {inviteInfo.role === "EDITOR" ? t("member.editor") : t("member.viewer")}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("invite.accountOwner")}</span>
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
                {t("invite.emailMismatchDescription", {
                  invited: inviteInfo.email,
                  current: userEmail || "",
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* 회원가입 안 한 경우 안내 */}
          {!inviteInfo.isUserRegistered && !isAuthenticated && (
            <Alert>
              <AlertDescription>
                {t("invite.signupRequired")}
              </AlertDescription>
            </Alert>
          )}

          {/* 버튼 */}
          <div className="space-y-2">
            {!isAuthenticated ? (
              <>
                {inviteInfo.isUserRegistered ? (
                  <Button onClick={handleAcceptInvite} className="w-full cursor-pointer" size="lg">
                    {t("invite.loginAndAccept")}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full cursor-pointer"
                      size="lg"
                    >
                      <Link to={`${ROUTES.REGISTER}?email=${encodeURIComponent(inviteInfo.email)}&inviteToken=${token}`}>
                        {t("invite.signupAndAccept")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full cursor-pointer"
                    >
                      <Link to={`${ROUTES.LOGIN}?email=${encodeURIComponent(inviteInfo.email)}&inviteToken=${token}`}>
                        {t("invite.alreadyHaveAccount")}
                      </Link>
                    </Button>
                  </>
                )}
              </>
            ) : emailMismatch ? (
              <Button variant="outline" asChild className="w-full cursor-pointer" size="lg">
                <Link to={ROUTES.LOGIN}>{t("invite.loginWithCorrectAccount")}</Link>
              </Button>
            ) : (
              <Button
                onClick={handleAcceptInvite}
                className="w-full cursor-pointer"
                size="lg"
                disabled={acceptInvite.isPending}
              >
                {acceptInvite.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("invite.accepting")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t("invite.accept")}
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

