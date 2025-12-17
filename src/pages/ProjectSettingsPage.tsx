import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Save, Plus, X, Lock } from "lucide-react";
import type { AxiosError } from "axios";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useLocales } from "@/hooks/useLocales";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { ROUTES } from "@/lib/constants";

const projectSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "프로젝트 이름을 입력해주세요")
    .max(100, "프로젝트 이름은 100자 이내로 입력해주세요"),
  defaultLocale: z.string().min(1, "기본 언어를 선택해주세요"),
  allowedDomains: z.array(z.string()).optional(),
});

type ProjectSettingsFormData = z.infer<typeof projectSettingsSchema>;

export function ProjectSettingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: isProjectLoading } = useProject(projectId!);
  const { data: locales, isLoading: isLocalesLoading } = useLocales(projectId!);
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(projectId!);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: project?.name || "",
      defaultLocale: project?.defaultLocale || "en",
      allowedDomains: project?.allowedDomains || [],
    },
    values: project
      ? {
          name: project.name,
          defaultLocale: project.defaultLocale,
          allowedDomains: project.allowedDomains || [],
        }
      : undefined,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedLocale = watch("defaultLocale");

  // 활성화된 언어만 필터링
  const activeLocales = locales?.filter((locale) => locale.isActive) || [];
  const availableLocales = SUPPORTED_LOCALES.filter((locale) =>
    activeLocales.some((l) => l.code === locale.code)
  );

  const [newDomain, setNewDomain] = useState("");
  const allowedDomains = watch("allowedDomains") || [];

  const handleAddDomain = () => {
    const trimmed = newDomain.trim();
    if (!trimmed) {
      toast.error("도메인을 입력해주세요");
      return;
    }

    // 와일드카드 패턴 또는 일반 도메인 형식 검증
    const isWildcard = trimmed.startsWith("*.");
    const domainToValidate = isWildcard ? trimmed.substring(2) : trimmed;
    const normalizedDomain = domainToValidate.toLowerCase();

    // localhost는 허용
    if (normalizedDomain === "localhost") {
      const finalDomain = isWildcard ? `*.${normalizedDomain}` : normalizedDomain;
      if (allowedDomains.includes(finalDomain)) {
        toast.error("이미 추가된 도메인입니다");
        return;
      }
      setValue("allowedDomains", [...allowedDomains, finalDomain]);
      setNewDomain("");
      return;
    }

    // 도메인 형식 검증 (와일드카드 제외한 부분)
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(normalizedDomain)) {
      toast.error("올바른 도메인 형식이 아닙니다 (예: example.com, *.example.com)");
      return;
    }

    const finalDomain = isWildcard ? `*.${normalizedDomain}` : normalizedDomain;
    if (allowedDomains.includes(finalDomain)) {
      toast.error("이미 추가된 도메인입니다");
      return;
    }

    setValue("allowedDomains", [...allowedDomains, finalDomain]);
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    setValue(
      "allowedDomains",
      allowedDomains.filter((d) => d !== domain)
    );
  };

  const onSubmit = (data: ProjectSettingsFormData) => {
    updateProject(
      {
        name: data.name !== project?.name ? data.name : undefined,
        defaultLocale: data.defaultLocale !== project?.defaultLocale ? data.defaultLocale : undefined,
        allowedDomains:
          JSON.stringify(data.allowedDomains || []) !==
          JSON.stringify(project?.allowedDomains || [])
            ? data.allowedDomains
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("프로젝트 설정이 저장되었습니다");
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "설정 저장에 실패했습니다");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!projectId) return;

    deleteProject(projectId, {
      onSuccess: () => {
        toast.success("프로젝트가 삭제되었습니다");
        navigate(ROUTES.DASHBOARD);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(axiosError.response?.data?.message || "프로젝트 삭제에 실패했습니다");
      },
    });
  };

  if (isProjectLoading || isLocalesLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">프로젝트를 찾을 수 없습니다</p>
              <p className="text-sm text-muted-foreground mt-2">
                삭제되었거나 접근 권한이 없습니다
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="프로젝트 설정"
          description="프로젝트 정보를 수정하거나 삭제할 수 있습니다"
        />

        {/* 프로젝트 정보 수정 */}
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 정보</CardTitle>
            <CardDescription>프로젝트 이름과 기본 언어를 변경할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">프로젝트 이름</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="프로젝트 이름"
                  disabled={isUpdating}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLocale">기본 언어</Label>
                <Select
                  value={selectedLocale}
                  onValueChange={(value) => setValue("defaultLocale", value)}
                  disabled={isUpdating || availableLocales.length === 0}
                >
                  <SelectTrigger id="defaultLocale">
                    <SelectValue placeholder="기본 언어 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocales.map((locale) => (
                      <SelectItem key={locale.code} value={locale.code}>
                        {locale.name} ({locale.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.defaultLocale && (
                  <p className="text-sm text-destructive">{errors.defaultLocale.message}</p>
                )}
                {availableLocales.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    활성화된 언어가 없습니다. 먼저 언어를 추가해주세요.
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating} className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* API 보안 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              API 보안 설정
            </CardTitle>
            <CardDescription>
              헤더 기반 API Key 사용 시 허용된 도메인을 설정할 수 있습니다. 설정하지 않으면 모든 도메인에서 사용 가능합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>허용된 도메인</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDomain();
                      }
                    }}
                    placeholder="example.com"
                    disabled={isUpdating}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDomain}
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  도메인만 입력하세요 (예: example.com, app.example.com, *.example.com). 프로토콜(http://)이나 경로(/)는 제외하세요.
                  <br />
                  <span className="font-semibold">와일드카드:</span> <code className="text-xs bg-muted px-1 rounded">*.example.com</code>을 입력하면 모든 서브도메인을 허용합니다.
                </p>
              </div>

              {allowedDomains.length > 0 && (
                <div className="space-y-2">
                  <Label>추가된 도메인</Label>
                  <div className="flex flex-wrap gap-2">
                    {allowedDomains.map((domain) => (
                      <div
                        key={domain}
                        className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
                      >
                        <span className="font-mono">{domain}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 cursor-pointer"
                          onClick={() => handleRemoveDomain(domain)}
                          disabled={isUpdating}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allowedDomains.length === 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3">
                  <p className="text-xs text-amber-900 dark:text-amber-100">
                    도메인을 설정하지 않으면 모든 도메인에서 API Key를 사용할 수 있습니다. 보안을 위해 허용된 도메인을 설정하는 것을 권장합니다.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating} className="cursor-pointer">
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* 위험 구역 */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">위험 구역</CardTitle>
            <CardDescription>
              프로젝트를 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "삭제 중..." : "프로젝트 삭제"}
            </Button>
          </CardContent>
        </Card>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>프로젝트 삭제 확인</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold">{project.name}</span> 프로젝트를 삭제하시겠습니까?
                <br />
                <br />
                이 작업은 되돌릴 수 없으며, 다음 데이터가 영구적으로 삭제됩니다:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>모든 언어 설정</li>
                  <li>모든 번역 키</li>
                  <li>모든 번역 데이터</li>
                  <li>API Key</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

