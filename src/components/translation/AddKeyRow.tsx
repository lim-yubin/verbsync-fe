import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeyAutocomplete } from "./KeyAutocomplete";
import type { TranslationMatrix } from "@/types/api";

interface AddKeyRowProps {
  keyName: string;
  keyDescription: string;
  existingKeys: string[];
  locales: TranslationMatrix["locales"];
  isCreating: boolean;
  onKeyNameChange: (value: string) => void;
  onKeyDescriptionChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function AddKeyRow({
  keyName,
  keyDescription,
  existingKeys,
  locales,
  isCreating,
  onKeyNameChange,
  onKeyDescriptionChange,
  onAdd,
  onCancel,
  onKeyDown,
}: AddKeyRowProps) {
  const isMac =
    navigator.platform.includes("Mac") || navigator.userAgent.includes("Mac");

  // dot(.)이 있는지 확인
  const isValidKeyName = keyName.trim().includes(".");

  return (
    <TableRow className="bg-background border-t-2 border-primary/20">
      <TableCell className="sticky left-0 bg-background z-10 border-r w-[50px]">
        {/* 체크박스 셀은 비워둠 */}
      </TableCell>
      <TableCell className="sticky left-0 bg-background z-10 border-r">
        <div className="space-y-2">
          <KeyAutocomplete
            value={keyName}
            onChange={onKeyNameChange}
            existingKeys={existingKeys}
            placeholder="새 키 이름 (예: login.title)"
            onKeyDown={onKeyDown}
            autoFocus
          />
          <Textarea
            placeholder="설명 (선택)"
            value={keyDescription}
            onChange={(e) => onKeyDescriptionChange(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            className="text-xs resize-none"
          />
          <div className="flex items-center gap-2">
            {!isValidKeyName && keyName.trim() ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="sm"
                      onClick={onAdd}
                      disabled={
                        isCreating || !keyName.trim() || !isValidKeyName
                      }
                      className="h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {isCreating ? "추가 중..." : "추가"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>키 이름은 dot notation이어야 합니다 (예: login.title)</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                size="sm"
                onClick={onAdd}
                disabled={isCreating || !keyName.trim() || !isValidKeyName}
                className="h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isCreating ? "추가 중..." : "추가"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={isCreating}
              className="h-7"
            >
              취소
            </Button>
            {keyName && (
              <span className="text-xs text-muted-foreground">
                {isMac ? "Cmd+Enter" : "Ctrl+Enter"}: 추가, Esc: 취소
              </span>
            )}
          </div>
        </div>
      </TableCell>
      {locales.map((locale) => (
        <TableCell key={locale.code} className="p-2">
          <div className="min-h-[60px] p-3 rounded bg-muted/50 flex items-center justify-center border-2 border-dashed">
            <span className="text-xs text-muted-foreground italic">
              키 추가 후 번역 가능
            </span>
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}
