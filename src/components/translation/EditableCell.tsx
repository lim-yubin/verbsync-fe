import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

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

  // 텍스트가 넘치는지 확인
  useEffect(() => {
    if (contentRef.current && !isEmpty) {
      const element = contentRef.current;
      setIsOverflowing(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth
      );
    } else {
      setIsOverflowing(false);
    }
  }, [value, isEmpty]);

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

  const cellContent = (
    <div
      ref={contentRef}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "min-h-[60px] max-h-[120px] p-3 rounded cursor-pointer transition-colors",
        "overflow-y-auto overflow-x-hidden",
        "break-words whitespace-pre-wrap",
        "hover:bg-accent/50",
        isEmpty && "bg-muted text-muted-foreground italic",
        isModified && "bg-yellow-100 dark:bg-yellow-950/30",
        !isEmpty && !isModified && "bg-background"
      )}
    >
      {isEmpty ? "(비어있음)" : value}
    </div>
  );

  // 텍스트가 넘치거나 비어있지 않으면 툴팁 표시
  if (isOverflowing || (!isEmpty && value.length > 50)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-md break-words whitespace-pre-wrap"
          >
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cellContent;
}

