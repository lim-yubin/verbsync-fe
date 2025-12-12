import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  isModified: boolean;
}

export function EditableCell({
  value,
  onChange,
  isModified,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const isEmpty = !value;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "min-h-[60px] p-3 rounded cursor-pointer transition-colors",
        "hover:bg-accent/50",
        isEmpty && "bg-muted text-muted-foreground italic",
        isModified && "bg-yellow-100 dark:bg-yellow-950/30",
        !isEmpty && !isModified && "bg-background"
      )}
    >
      {isEmpty ? "(비어있음)" : value}
    </div>
  );
}

