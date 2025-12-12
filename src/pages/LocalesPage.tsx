import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocales, useCreateLocale, useUpdateLocaleStatus } from "@/hooks/useLocales";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { mutate: createLocale, isPending: isCreating } = useCreateLocale(projectId!);

  // 이미 추가된 언어 코드 목록
  const addedLocaleCodes = useMemo(
    () => new Set(locales?.map((l) => l.code) || []),
    [locales]
  );

  // 선택 가능한 언어 목록 (이미 추가된 언어 제외)
  const availableLocales = useMemo(
    () => SUPPORTED_LOCALES.filter((locale) => !addedLocaleCodes.has(locale.code)),
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
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "언어 추가에 실패했습니다");
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
                disabled={isCreating || !selectedLocaleCode || availableLocales.length === 0}
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
  locale: any;
  projectId: string;
  isDefault: boolean;
}

function LocaleItem({ locale, projectId, isDefault }: LocaleItemProps) {
  const { mutate: updateStatus, isPending } = useUpdateLocaleStatus(
    projectId,
    locale.id
  );

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
        onError: () => {
          toast.error("상태 변경에 실패했습니다");
        },
      }
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-semibold text-lg">
            {locale.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{locale.name}</h3>
              {isDefault && <Badge variant="secondary">기본 언어</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {locale.code.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor={`switch-${locale.id}`} className="text-sm">
              {locale.isActive ? "활성화됨" : "비활성화됨"}
            </Label>
            <Switch
              id={`switch-${locale.id}`}
              checked={locale.isActive}
              onCheckedChange={handleToggle}
              disabled={isPending || (isDefault && locale.isActive)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

