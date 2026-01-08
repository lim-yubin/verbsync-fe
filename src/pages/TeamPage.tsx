import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MemberList } from "@/components/member";
import { useMembers } from "@/hooks/useMembers";
import { User, Mail, Crown } from "lucide-react";
import { useMemo } from "react";

export function TeamPage() {
  const { t } = useTranslation();
  const { data: members, isLoading: isMembersLoading } = useMembers();

  const isLoading = isMembersLoading;

  // Owner 찾기 (role이 "OWNER"인 멤버)
  const owner = useMemo(() => {
    if (!members) return null;
    return members.find((member) => member.role === "OWNER");
  }, [members]);

  // Owner를 제외한 멤버 목록
  const teamMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((member) => member.role !== "OWNER");
  }, [members]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("team.title")}
          description={t("team.description")}
        />

        {/* Owner 정보 */}
        {owner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                {t("team.accountOwner")}
              </CardTitle>
              <CardDescription>
                {t("team.accountOwnerDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{owner.user?.name || t("common.unknown")}</p>
                    <Badge variant="default">{t("member.owner")}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {owner.user?.email || t("common.noEmail")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 팀 멤버 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("team.teamMembers")}
            </CardTitle>
            <CardDescription>
              {t("team.teamMembersDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("team.noTeamMembers")}</p>
              </div>
            ) : (
              <MemberList canManage={false} members={teamMembers} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

