import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  isModified: boolean;
  disabled?: boolean; // 편집 불가 여부 (VIEWER 권한)
}

export function EditableCell({
  value,
  onChange,
  isModified,
  disabled = false,
}: EditableCellProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = !value;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none"
        rows={2}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "min-h-[60px] max-h-[120px] p-3 rounded transition-colors",
        "overflow-y-auto overflow-x-hidden",
        "break-words whitespace-pre-wrap",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-accent/50",
        isEmpty && "bg-muted text-muted-foreground italic",
        isModified && "bg-yellow-100 dark:bg-yellow-950/30",
        !isEmpty && !isModified && "bg-background"
      )}
      title={disabled ? t("translation.cannotEdit") : undefined}
    >
      {isEmpty ? t("translation.empty") : value}
    </div>
  );
}
