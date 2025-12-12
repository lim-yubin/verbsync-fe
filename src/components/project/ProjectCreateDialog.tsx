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
import { useCreateProject } from "@/hooks/useProjects";
import { ROUTES } from "@/lib/constants";

const SUPPORTED_LOCALES = [
  { value: "en", label: "English (en)" },
  { value: "ko", label: "한국어 (ko)" },
  { value: "ja", label: "日本語 (ja)" },
  { value: "zh", label: "中文 (zh)" },
  { value: "es", label: "Español (es)" },
  { value: "fr", label: "Français (fr)" },
  { value: "de", label: "Deutsch (de)" },
] as const;

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "프로젝트 이름을 입력해주세요")
    .max(50, "프로젝트 이름은 50자 이내로 입력해주세요"),
  defaultLocale: z.string().min(1, "기본 언어를 선택해주세요"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
}: ProjectCreateDialogProps) {
  const navigate = useNavigate();
  const { mutate: createProject, isPending } = useCreateProject();

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

  const onSubmit = (data: ProjectFormData) => {
    createProject(data, {
      onSuccess: (project) => {
        toast.success("프로젝트가 생성되었습니다!");
        reset();
        onOpenChange(false);
        navigate(ROUTES.PROJECT_DETAIL(project.id));
      },
      onError: (error) => {
        console.error(error);
        toast.error("프로젝트 생성에 실패했습니다");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
          <DialogDescription>
            번역 프로젝트를 생성하고 다국어 관리를 시작하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* 프로젝트 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              프로젝트 이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My App"
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
              기본 언어 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedLocale}
              onValueChange={(value) => setValue("defaultLocale", value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="언어를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LOCALES.map((locale) => (
                  <SelectItem key={locale.value} value={locale.value}>
                    {locale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.defaultLocale && (
              <p className="text-sm text-destructive">
                {errors.defaultLocale.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              기본 언어는 나중에 변경할 수 없습니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "생성 중..." : "프로젝트 생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

