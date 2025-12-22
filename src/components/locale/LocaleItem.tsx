import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
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
import {
  useUpdateLocaleStatus,
  useDeleteLocale,
  type Locale,
} from "@/hooks/useLocales";
import { cn } from "@/lib/utils";

interface LocaleItemProps {
  locale: Locale;
  projectId: string;
  isDefault: boolean;
  canEdit?: boolean; // 편집 권한 여부 (OWNER 또는 EDITOR만 가능)
}

export function LocaleItem({ locale, projectId, isDefault, canEdit = true }: LocaleItemProps) {
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
          axiosError.response?.data?.message || "삭제에 실패했습니다"
        );
      },
    });
  };

  return (
    <>
      <Card
        className={cn(
          "p-4 transition-opacity",
          !locale.isActive && "opacity-60"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{locale.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {locale.code}
                </Badge>
                {isDefault && (
                  <Badge variant="outline" className="text-xs">
                    기본 언어
                  </Badge>
                )}
                {!locale.isActive && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    비활성화
                  </Badge>
                )}
              </div>
              {isDefault && (
                <p className="text-xs text-muted-foreground mt-1">
                  기본 언어 (삭제 불가)
                </p>
              )}
            </div>
            {canEdit && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={locale.isActive}
                    onCheckedChange={handleToggle}
                    disabled={isDefault || isUpdating}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {locale.isActive ? "활성화" : "비활성화"}
                  </span>
                </div>
                {!isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isDeleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>언어 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{locale.name}</span> (
              {locale.code}) 언어를 삭제하시겠습니까?
              <br />
              <br />이 작업은 되돌릴 수 없으며, 해당 언어의 모든 번역 데이터가
              영구적으로 삭제됩니다.
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
    </>
  );
}
