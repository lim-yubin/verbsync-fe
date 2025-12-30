import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUPPORTED_LOCALES, getLocaleName } from "@/lib/locales";
import { toast } from "sonner";
import type { Locale } from "@/hooks/useLocales";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { usePlan } from "@/hooks/usePlan";
import { canAddLocale, getUpgradeMessage } from "@/lib/plans";
import { useNavigate } from "react-router-dom";

interface AddLocaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingLocales: Locale[];
}

export function AddLocaleDialog({
  open,
  onOpenChange,
  projectId,
  existingLocales,
}: AddLocaleDialogProps) {
  const { t, i18n } = useTranslation();
  const [selectedLocaleCodes, setSelectedLocaleCodes] = useState<Set<string>>(
    new Set()
  );
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { data: planInfo } = usePlan();
  const navigate = useNavigate();

  // 이미 추가된 언어 제외
  const availableLocales = SUPPORTED_LOCALES.filter(
    (locale) => !existingLocales.some((l) => l.code === locale.code)
  );

  const handleToggleLocale = (localeCode: string) => {
    setSelectedLocaleCodes((prev) => {
      const next = new Set(prev);
      if (next.has(localeCode)) {
        next.delete(localeCode);
      } else {
        next.add(localeCode);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedLocaleCodes.size === availableLocales.length) {
      setSelectedLocaleCodes(new Set());
    } else {
      setSelectedLocaleCodes(new Set(availableLocales.map((l) => l.code)));
    }
  };

  const handleCreate = async () => {
    if (selectedLocaleCodes.size === 0) {
      toast.error(t("addLocale.selectLocaleFirst"));
      return;
    }

    // 플랜 제한 체크
    if (planInfo) {
      const activeLocales = existingLocales.filter((l) => l.isActive);
      const willExceedLimit = !canAddLocale(
        planInfo.plan,
        activeLocales.length + selectedLocaleCodes.size
      );

      if (willExceedLimit) {
        const limit =
          planInfo.plan === "FREE"
            ? 3
            : planInfo.plan === "STARTER"
            ? 10
            : Infinity;
        toast.error(
          t("addLocale.localeLimitReached", { limit }),
          {
            description: getUpgradeMessage(planInfo.plan, "locales"),
            action: {
              label: t("projectCreate.viewPlan"),
              onClick: () => {
                navigate(ROUTES.PRICING);
                onOpenChange(false);
              },
            },
          }
        );
        return;
      }
    }

    setIsAdding(true);
    const selectedLocales = SUPPORTED_LOCALES.filter((locale) =>
      selectedLocaleCodes.has(locale.code)
    );

    let successCount = 0;
    let failCount = 0;

    // 순차적으로 언어 추가
    for (const locale of selectedLocales) {
      try {
        await api.post<Locale>(`/projects/${projectId}/locales`, {
          code: locale.code,
          name: locale.nameKo,
        });
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to add locale ${locale.code}:`, error);
      }
    }

    // 쿼리 무효화
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.LOCALES(projectId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.TRANSLATIONS_MATRIX(projectId),
    });

    setIsAdding(false);

    if (successCount > 0) {
      if (failCount > 0) {
        toast.success(t("addLocale.addPartial", { count: successCount, failed: failCount }));
      } else {
        toast.success(t("addLocale.addSuccess", { count: successCount }));
      }
      setSelectedLocaleCodes(new Set());
      onOpenChange(false);
    } else {
      toast.error(t("addLocale.addFailed"));
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setSelectedLocaleCodes(new Set());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("addLocale.title")}</DialogTitle>
          <DialogDescription>
            {t("addLocale.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
          {availableLocales.length === 0 ? (
            <div className="rounded-md border p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("addLocale.noAvailableLocales")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("addLocale.allLocalesAdded")}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>
                  {t("addLocale.selectLocales")}{" "}
                  <span className="text-destructive">
                    ({t("addLocale.selectedCount", { count: selectedLocaleCodes.size })})
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isAdding}
                  className="cursor-pointer"
                >
                  {selectedLocaleCodes.size === availableLocales.length
                    ? t("addLocale.deselectAll")
                    : t("addLocale.selectAll")}
                </Button>
              </div>
              <div className="border rounded-md overflow-auto flex-1 max-h-[400px]">
                <div className="p-2 space-y-1">
                  {availableLocales.map((locale) => {
                    const isSelected = selectedLocaleCodes.has(locale.code);
                    return (
                      <div
                        key={locale.code}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleToggleLocale(locale.code)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleLocale(locale.code)}
                          disabled={isAdding}
                          className="pointer-events-none"
                        />
                        <Label
                          className="flex-1 cursor-pointer font-normal"
                          htmlFor={`locale-${locale.code}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {getLocaleName(locale, i18n.language)} ({locale.code.toUpperCase()})
                            </span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAdding}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isAdding ||
                selectedLocaleCodes.size === 0 ||
                availableLocales.length === 0
              }
              className="cursor-pointer"
            >
              {isAdding
                ? t("addLocale.adding", { count: selectedLocaleCodes.size })
                : t("addLocale.add", { count: selectedLocaleCodes.size })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

