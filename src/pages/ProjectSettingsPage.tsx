import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import { useLocales } from "@/hooks/useLocales";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { ROUTES } from "@/lib/constants";
import type { UpdateProjectDto } from "@/types/api";

type ProjectSettingsFormData = {
  name: string;
  defaultLocale: string;
  allowedDomains?: string[];
};

export function ProjectSettingsPage() {
  const { t } = useTranslation();
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const projectSettingsSchema = z.object({
    name: z
      .string()
      .min(1, t("projectSettings.nameRequired"))
      .max(100, t("projectSettings.nameMaxLength")),
    defaultLocale: z.string().min(1, t("projectSettings.defaultLocaleRequired")),
    allowedDomains: z.array(z.string()).optional(),
  });
  const { data: project, isLoading: isProjectLoading } = useProject(projectId!);
  const { data: locales, isLoading: isLocalesLoading } = useLocales(projectId!);
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
    projectId!
  );
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
      toast.error(t("projectSettings.domainRequired"));
      return;
    }

    // 와일드카드 패턴 또는 일반 도메인 형식 검증
    const isWildcard = trimmed.startsWith("*.");
    const domainToValidate = isWildcard ? trimmed.substring(2) : trimmed;
    const normalizedDomain = domainToValidate.toLowerCase();

    // localhost 허용
    if (normalizedDomain === "localhost") {
      const finalDomain = isWildcard
        ? `*.${normalizedDomain}`
        : normalizedDomain;
      if (allowedDomains.includes(finalDomain)) {
        toast.error(t("projectSettings.domainExists"));
        return;
      }
      setValue("allowedDomains", [...allowedDomains, finalDomain]);
      setNewDomain("");
      return;
    }

    // 도메인 형식 검증 (와일드카드 제외한 부분)
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

    if (!domainRegex.test(normalizedDomain)) {
      toast.error(t("projectSettings.domainInvalid"));
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

  const onInvalid = (errors: FieldErrors<ProjectSettingsFormData>) => {
    console.error("Form Validation Errors:", errors);
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const onSubmit = (data: ProjectSettingsFormData) => {
    const updates: UpdateProjectDto = {
      name: data.name !== project?.name ? data.name : undefined,
      defaultLocale:
        data.defaultLocale !== project?.defaultLocale
          ? data.defaultLocale
          : undefined,
      allowedDomains:
        JSON.stringify(data.allowedDomains || []) !==
        JSON.stringify(project?.allowedDomains || [])
          ? data.allowedDomains
          : undefined,
    };

    // 필드 중 하나라도 존재할 때만 API 호출
    if (Object.values(updates).every((v) => v === undefined)) {
      toast.info(t("projectSettings.noChanges"));
      return;
    }

    updateProject(updates, {
      onSuccess: () => {
        toast.success(t("projectSettings.saveSuccess"));
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message || t("projectSettings.saveFailed")
        );
      },
    });
  };

  const handleDelete = () => {
    if (!projectId) return;

    deleteProject(projectId, {
      onSuccess: () => {
        toast.success(t("projectSettings.deleteSuccess"));
        navigate(ROUTES.DASHBOARD);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message || t("projectSettings.deleteFailed")
        );
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
              <p className="text-lg font-semibold">
                {t("project.notFound")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("project.notFoundDescription")}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // 소유자만 프로젝트 설정 수정 가능
  const isOwner = project.isOwner;
  // 편집 권한 확인 (OWNER 또는 EDITOR만 편집 가능, VIEWER는 조회만)
  const canEdit = project.isOwner || project.role === "EDITOR";

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("projectSettings.title")}
          description={t("projectSettings.description")}
        />

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          {/* 프로젝트 정보 수정 */}
          <Card>
            <CardHeader>
              <CardTitle>{t("projectSettings.projectInfo")}</CardTitle>
              <CardDescription>
                {t("projectSettings.projectInfoDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("project.projectName")}</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={t("projectSettings.namePlaceholder")}
                  disabled={isUpdating || !isOwner}
                  readOnly={!isOwner}
                />
                {!isOwner && (
                  <p className="text-xs text-muted-foreground">
                    {t("projectSettings.onlyOwnerCanChangeName")}
                  </p>
                )}
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLocale">{t("project.defaultLocale")}</Label>
                <Select
                  value={selectedLocale}
                  onValueChange={(value) => setValue("defaultLocale", value)}
                  disabled={isUpdating || availableLocales.length === 0}
                >
                  <SelectTrigger id="defaultLocale">
                    <SelectValue placeholder={t("projectSettings.defaultLocalePlaceholder")} />
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
                  <p className="text-sm text-destructive">
                    {errors.defaultLocale.message}
                  </p>
                )}
                {availableLocales.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("projectSettings.noActiveLocales")}
                  </p>
                )}
              </div>

              {isOwner && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API 보안 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("projectSettings.apiSecurity")}
              </CardTitle>
              <CardDescription>
                {t("projectSettings.apiSecurityDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("projectSettings.allowedDomains")}</Label>
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
                    placeholder={t("projectSettings.domainPlaceholder")}
                    disabled={isUpdating || !canEdit}
                    readOnly={!canEdit}
                  />
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDomain}
                      disabled={isUpdating}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!canEdit && (
                  <p className="text-xs text-muted-foreground">
                    {t("projectSettings.viewerCannotEdit")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("projectSettings.domainHint")}
                  <br />
                  <span className="font-semibold text-primary">
                    {t("projectSettings.localTest")}
                  </span>{" "}
                  {t("projectSettings.localhost")}
                  <br />
                  <span className="font-semibold">{t("projectSettings.wildcard")}</span>{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    *.example.com
                  </code>
                  {t("projectSettings.wildcardDescription")}
                </p>
              </div>

              {allowedDomains.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("projectSettings.addedDomains")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {allowedDomains.map((domain) => (
                      <div
                        key={domain}
                        className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
                      >
                        <span className="font-mono">{domain}</span>
                        {canEdit && (
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allowedDomains.length === 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3">
                  <p className="text-xs text-amber-900 dark:text-amber-100">
                    {t("projectSettings.noDomainWarning")}
                  </p>
                </div>
              )}

              {canEdit && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        {isOwner && (
          <>
            <Separator />

            {/* 위험 구역 */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{t("settings.dangerZone")}</CardTitle>
                <CardDescription>
                  {t("projectSettings.deleteWarning")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? t("common.deleting") : t("projectSettings.deleteButton")}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("projectSettings.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold">{project.name}</span> {t("projectSettings.deleteDescription")}
                <br />
                <br />{t("projectSettings.deleteWarning")}
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t("projectSettings.deleteItems")}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                {isDeleting ? t("common.deleting") : t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
