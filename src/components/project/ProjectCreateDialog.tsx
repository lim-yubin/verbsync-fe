import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { useCreateLocale } from "@/hooks/useLocales";
import { usePlan } from "@/hooks/usePlan";
import { ROUTES } from "@/lib/constants";
import { SUPPORTED_LOCALES, getLocaleName } from "@/lib/locales";
import { canCreateProject, getUpgradeMessage } from "@/lib/plans";

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
}: ProjectCreateDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const projectSchema = z.object({
    name: z
      .string()
      .min(1, t("projectCreate.nameRequired"))
      .max(50, t("projectCreate.nameMaxLength")),
    defaultLocale: z.string().min(1, t("projectCreate.defaultLocaleRequired")),
  });

  type ProjectFormData = z.infer<typeof projectSchema>;
  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject();
  const { data: projects } = useProjects();
  const { data: planInfo } = usePlan();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      defaultLocale: "en",
    },
  });

  const selectedLocale = watch("defaultLocale");

  // 기본 언어 추가를 위한 상태
  const [pendingLocaleCreation, setPendingLocaleCreation] = useState<{
    projectId: string;
    code: string;
    name: string;
  } | null>(null);

  // 프로젝트 생성 후 기본 언어 추가
  const { mutate: createLocale, isPending: isCreatingLocale } = useCreateLocale(
    pendingLocaleCreation?.projectId || ""
  );

  const isPending = isCreatingProject || isCreatingLocale;

  // pendingLocaleCreation이 설정되면 기본 언어 추가
  useEffect(() => {
    if (pendingLocaleCreation) {
      createLocale(
        {
          code: pendingLocaleCreation.code,
          name: pendingLocaleCreation.name,
        },
        {
          onSuccess: () => {
            toast.success(t("projectCreate.createSuccess"));
            reset();
            onOpenChange(false);
            navigate(ROUTES.PROJECT_DETAIL(pendingLocaleCreation.projectId));
            setPendingLocaleCreation(null);
          },
          onError: (error) => {
            console.error(error);
            toast.error(t("projectCreate.localeAddFailed"));
            // 프로젝트는 생성되었으므로 상세 페이지로 이동
            navigate(ROUTES.PROJECT_DETAIL(pendingLocaleCreation.projectId));
            setPendingLocaleCreation(null);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingLocaleCreation]);

  const onSubmit = (data: ProjectFormData) => {
    // 플랜 제한 체크
    if (planInfo) {
      const ownedProjects = projects?.filter((p) => p.isOwner) || [];
      if (!canCreateProject(planInfo.plan, ownedProjects.length)) {
        const limit =
          planInfo.plan === "FREE"
            ? 1
            : planInfo.plan === "STARTER"
            ? 5
            : Infinity;
        toast.error(t("projectCreate.projectLimitReached", { limit }), {
          description: getUpgradeMessage(t, planInfo.plan, "projects"),
          action: {
            label: t("projectCreate.viewPlan"),
            onClick: () => {
              navigate(ROUTES.PRICING);
              onOpenChange(false);
            },
          },
        });
        return;
      }
    }

    createProject(data, {
      onSuccess: (project) => {
        // 선택된 기본 언어 정보 찾기
        const selectedLocaleInfo = SUPPORTED_LOCALES.find(
          (locale) => locale.code === data.defaultLocale
        );

        if (!selectedLocaleInfo) {
          toast.error(t("projectCreate.localeNotFound"));
          return;
        }

        // 기본 언어 추가를 위한 상태 설정
        setPendingLocaleCreation({
          projectId: project.id,
          code: data.defaultLocale,
          name: selectedLocaleInfo.nameKo,
        });
      },
      onError: (error) => {
        console.error(error);
        toast.error(t("projectCreate.createFailed"));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("projectCreate.title")}</DialogTitle>
          <DialogDescription>
            {t("projectCreate.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* 프로젝트 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("project.projectName")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t("projectCreate.namePlaceholder")}
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* 기본 언어 */}
          <div className="space-y-2">
            <Label htmlFor="defaultLocale">
              {t("project.defaultLocale")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedLocale}
              onValueChange={(value) => setValue("defaultLocale", value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("projectCreate.defaultLocalePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LOCALES.map((locale) => (
                  <SelectItem key={locale.code} value={locale.code}>
                    {getLocaleName(locale, i18n.language)} (
                    {locale.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.defaultLocale && (
              <p className="text-sm text-destructive">
                {errors.defaultLocale.message}
              </p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending
                ? t("projectCreate.creating")
                : t("projectCreate.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
