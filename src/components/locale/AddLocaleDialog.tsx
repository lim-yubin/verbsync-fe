import { useState } from "react";
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
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { toast } from "sonner";
import type { Locale } from "@/hooks/useLocales";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

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
  const [selectedLocaleCodes, setSelectedLocaleCodes] = useState<Set<string>>(
    new Set()
  );
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

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
      toast.error("언어를 선택해주세요");
      return;
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
          name: locale.name,
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
      toast.success(
        `${successCount}개의 언어가 추가되었습니다${
          failCount > 0 ? ` (${failCount}개 실패)` : ""
        }`
      );
      setSelectedLocaleCodes(new Set());
      onOpenChange(false);
    } else {
      toast.error("언어 추가에 실패했습니다");
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
          <DialogTitle>새 언어 추가</DialogTitle>
          <DialogDescription>
            프로젝트에 지원할 언어를 선택하세요 (여러 개 선택 가능)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
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
            <>
              <div className="flex items-center justify-between">
                <Label>
                  언어 선택{" "}
                  <span className="text-destructive">
                    ({selectedLocaleCodes.size}개 선택됨)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isAdding}
                >
                  {selectedLocaleCodes.size === availableLocales.length
                    ? "전체 해제"
                    : "전체 선택"}
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
                              {locale.name} ({locale.code.toUpperCase()})
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
            >
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isAdding ||
                selectedLocaleCodes.size === 0 ||
                availableLocales.length === 0
              }
            >
              {isAdding
                ? `추가 중... (${selectedLocaleCodes.size}개)`
                : `${selectedLocaleCodes.size}개 추가`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

