import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useLocales,
  useCreateLocale,
  useUpdateLocaleStatus,
  useDeleteLocale,
  type Locale,
} from "@/hooks/useLocales";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/useProjects";
import { SUPPORTED_LOCALES } from "@/lib/locales";

export function LocalesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocaleCode, setSelectedLocaleCode] = useState<string>("");

  const { data: project } = useProject(projectId!);
  const { data: locales, isLoading } = useLocales(projectId!);
  const { mutate: createLocale, isPending: isCreating } = useCreateLocale(
    projectId!
  );

  // 이미 추가된 언어 코드 목록
  const addedLocaleCodes = useMemo(
    () => new Set(locales?.map((l) => l.code) || []),
    [locales]
  );

  // 선택 가능한 언어 목록 (이미 추가된 언어 제외)
  const availableLocales = useMemo(
    () =>
      SUPPORTED_LOCALES.filter((locale) => !addedLocaleCodes.has(locale.code)),
    [addedLocaleCodes]
  );

  const handleCreate = () => {
    if (!selectedLocaleCode) {
      toast.error("언어를 선택해주세요");
      return;
    }

    const selectedLocale = SUPPORTED_LOCALES.find(
      (l) => l.code === selectedLocaleCode
    );

    if (!selectedLocale) {
      toast.error("선택한 언어를 찾을 수 없습니다");
      return;
    }

    createLocale(
      { code: selectedLocale.code, name: selectedLocale.name },
      {
        onSuccess: () => {
          toast.success("언어가 추가되었습니다");
          setDialogOpen(false);
          setSelectedLocaleCode("");
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "언어 추가에 실패했습니다"
          );
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="언어 관리"
          description="프로젝트에서 지원하는 언어를 관리하세요"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              언어 추가
            </Button>
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : !locales || locales.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                아직 추가된 언어가 없습니다
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {locales.map((locale) => (
              <LocaleItem
                key={locale.id}
                locale={locale}
                projectId={projectId!}
                isDefault={locale.code === project?.defaultLocale}
              />
            ))}
          </div>
        )}
      </div>

      {/* 언어 추가 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 언어 추가</DialogTitle>
            <DialogDescription>
              프로젝트에 지원할 언어를 추가하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="locale">
                언어 선택 <span className="text-destructive">*</span>
              </Label>
              {availableLocales.length === 0 ? (
                <div className="rounded-md border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    추가 가능한 언어가 없습니다
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    모든 지원 언어가 이미 추가되었습니다
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedLocaleCode}
                  onValueChange={setSelectedLocaleCode}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="언어를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocales.map((locale) => (
                      <SelectItem key={locale.code} value={locale.code}>
                        {locale.name} ({locale.code.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  isCreating ||
                  !selectedLocaleCode ||
                  availableLocales.length === 0
                }
              >
                {isCreating ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

interface LocaleItemProps {
  locale: Locale;
  projectId: string;
  isDefault: boolean;
}

function LocaleItem({ locale, projectId, isDefault }: LocaleItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLocaleStatus(
    projectId,
    locale.id
  );
  const { mutate: deleteLocale, isPending: isDeleting } =
    useDeleteLocale(projectId);

  const handleToggle = (checked: boolean) => {
    if (isDefault && !checked) {
      toast.error("기본 언어는 비활성화할 수 없습니다");
      return;
    }

    updateStatus(
      { isActive: checked },
      {
        onSuccess: () => {
          toast.success(
            checked ? "언어가 활성화되었습니다" : "언어가 비활성화되었습니다"
          );
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "상태 변경에 실패했습니다"
          );
        },
      }
    );
  };

  const handleDelete = () => {
    deleteLocale(locale.id, {
      onSuccess: () => {
        toast.success("언어가 삭제되었습니다");
        setDeleteDialogOpen(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "언어 삭제에 실패했습니다"
        );
      },
    });
  };

  return (
    <Card
      className={`p-6 transition-opacity ${
        !locale.isActive ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg font-semibold text-lg ${
              locale.isActive ? "bg-muted" : "bg-muted/50"
            }`}
          >
            {locale.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold ${
                  !locale.isActive ? "text-muted-foreground" : ""
                }`}
              >
                {locale.name}
              </h3>
              {isDefault && <Badge variant="secondary">기본 언어</Badge>}
              {!locale.isActive && (
                <Badge variant="outline" className="text-xs">
                  비활성화
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {locale.code.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Label
                htmlFor={`switch-${locale.id}`}
                className={`text-sm cursor-pointer ${
                  !locale.isActive ? "text-muted-foreground" : ""
                }`}
              >
                {locale.isActive ? "활성화됨" : "비활성화됨"}
              </Label>
              {!locale.isActive && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  번역 테이블에서 숨김
                </p>
              )}
            </div>
            <Switch
              id={`switch-${locale.id}`}
              checked={locale.isActive}
              onCheckedChange={handleToggle}
              disabled={isUpdating || (isDefault && locale.isActive)}
            />
          </div>
          {!isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting || isUpdating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>언어 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{locale.name}</span> (
              {locale.code.toUpperCase()}) 언어를 삭제하시겠습니까?
              <br />
              <br />이 작업은 되돌릴 수 없으며, 해당 언어의 모든 번역 데이터가
              영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
