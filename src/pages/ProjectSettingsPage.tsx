import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Save } from "lucide-react";
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
    reset,
  } = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: project?.name || "",
      defaultLocale: project?.defaultLocale || "en",
    },
    values: project
      ? {
          name: project.name,
          defaultLocale: project.defaultLocale,
        }
      : undefined,
  });

  const selectedLocale = watch("defaultLocale");

  // 활성화된 언어만 필터링
  const activeLocales = locales?.filter((locale) => locale.isActive) || [];
  const availableLocales = SUPPORTED_LOCALES.filter((locale) =>
    activeLocales.some((l) => l.code === locale.code)
  );

  const onSubmit = (data: ProjectSettingsFormData) => {
    updateProject(
      {
        name: data.name !== project?.name ? data.name : undefined,
        defaultLocale: data.defaultLocale !== project?.defaultLocale ? data.defaultLocale : undefined,
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
                <Button type="submit" disabled={isUpdating}>
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

