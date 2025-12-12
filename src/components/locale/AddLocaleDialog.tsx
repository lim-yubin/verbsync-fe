import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateLocale } from "@/hooks/useLocales";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { toast } from "sonner";
import type { Locale } from "@/hooks/useLocales";

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
  const [selectedLocaleCode, setSelectedLocaleCode] = useState("");
  const { mutate: createLocale, isPending: isCreating } = useCreateLocale(
    projectId
  );

  // 이미 추가된 언어 제외
  const availableLocales = SUPPORTED_LOCALES.filter(
    (locale) => !existingLocales.some((l) => l.code === locale.code)
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
      {
        code: selectedLocale.code,
        name: selectedLocale.name,
      },
      {
        onSuccess: () => {
          toast.success("언어가 추가되었습니다");
          setSelectedLocaleCode("");
          onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}

