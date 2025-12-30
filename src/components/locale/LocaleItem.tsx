import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLocaleNameByCode } from "@/lib/locales";
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
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLocaleStatus(
    projectId,
    locale.id
  );
  const { mutate: deleteLocale, isPending: isDeleting } =
    useDeleteLocale(projectId);

  const handleToggle = (checked: boolean) => {
    if (isDefault && !checked) {
      toast.error(t("locale.cannotDisableDefault"));
      return;
    }

    updateStatus(
      { isActive: checked },
      {
        onSuccess: () => {
          toast.success(
            checked ? t("locale.activated") : t("locale.deactivated")
          );
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || t("locale.statusChangeFailed")
          );
        },
      }
    );
  };

  const handleDelete = () => {
    deleteLocale(locale.id, {
      onSuccess: () => {
        toast.success(t("locale.deleted"));
        setDeleteDialogOpen(false);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || t("locale.deleteFailed")
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
                <span className="font-semibold">{getLocaleNameByCode(locale.code, i18n.language)}</span>
                <Badge variant="secondary" className="text-xs">
                  {locale.code}
                </Badge>
                {isDefault && (
                  <Badge variant="outline" className="text-xs">
                    {t("locale.defaultLocale")}
                  </Badge>
                )}
                {!locale.isActive && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {t("locale.isInactive")}
                  </Badge>
                )}
              </div>
              {isDefault && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("locale.defaultLocale")} ({t("common.delete")} {t("common.cannot")})
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
                    {locale.isActive ? t("locale.isActive") : t("locale.isInactive")}
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
            <AlertDialogTitle>{t("locale.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{locale.name}</span> (
              {locale.code}) {t("locale.deleteConfirmDescription")}
              <br />
              <br />{t("locale.deleteWarning")}
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
    </>
  );
}
