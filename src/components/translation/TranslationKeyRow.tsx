import { Edit2, Trash2, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EditableCell } from "./EditableCell";
import type { TranslationMatrix } from "@/types/api";
import type { Key } from "@/types/api";

interface TranslationKeyRowProps {
  row: TranslationMatrix["rows"][0];
  locales: TranslationMatrix["locales"];
  keyData?: Key;
  isSelected: boolean;
  isEditing: boolean;
  editingName: string;
  editingDescription: string | null;
  changes: Record<string, string>;
  onSelect: (checked: boolean) => void;
  onStartEdit: () => void;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string | null) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onCellChange: (locale: string, value: string) => void;
  isUpdatingKey: boolean;
  isDeletingKey: boolean;
}

export function TranslationKeyRow({
  row,
  locales,
  keyData,
  isSelected,
  isEditing,
  editingName,
  editingDescription,
  changes,
  onSelect,
  onStartEdit,
  onEditNameChange,
  onEditDescriptionChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onCellChange,
  isUpdatingKey,
  isDeletingKey,
}: TranslationKeyRowProps) {
  return (
    <TableRow
      className={cn(isSelected && "bg-accent/50")}
    >
      <TableCell className="sticky left-0 bg-background z-10 border-r w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="cursor-pointer"
        />
      </TableCell>
      <TableCell className="sticky left-0 bg-background z-10 border-r min-w-[300px]">
        {isEditing && keyData ? (
          <div className="space-y-2">
            <Input
              value={editingName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="font-mono text-sm h-8"
              placeholder="키 이름"
            />
            <Textarea
              value={editingDescription || ""}
              onChange={(e) =>
                onEditDescriptionChange(e.target.value || null)
              }
              placeholder="설명 (선택)"
              rows={2}
              className="text-xs resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onSaveEdit}
                disabled={isUpdatingKey}
                className="h-7 px-2"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                disabled={isUpdatingKey}
                className="h-7 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="font-mono text-sm font-semibold">{row.key}</div>
            {row.description && (
              <div className="text-xs text-muted-foreground mt-1">
                {row.description}
              </div>
            )}
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onStartEdit}
                disabled={isDeletingKey}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                disabled={isDeletingKey}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </TableCell>
      {locales.map((locale) => {
        const changeKey = `${row.key}|${locale.code}`;
        const currentValue =
          changeKey in changes
            ? changes[changeKey]
            : row.translations[locale.code] || "";
        const isModified = changeKey in changes;

        return (
          <TableCell key={locale.code} className="p-2 max-w-[300px]">
            <EditableCell
              value={currentValue}
              onChange={(value) => onCellChange(locale.code, value)}
              isModified={isModified}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

