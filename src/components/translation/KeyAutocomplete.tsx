import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface KeyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  existingKeys: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function KeyAutocomplete({
  value,
  onChange,
  onKeyDown,
  existingKeys,
  placeholder = "새 키 이름 (예: login.title)",
  className,
  autoFocus,
}: KeyAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 자동완성 제안 계산
  const suggestions = useMemo(() => {
    if (!value.trim() || existingKeys.length === 0) return [];

    const input = value.trim();
    const lastDotIndex = input.lastIndexOf(".");

    // 현재 입력 중인 부분 추출
    if (lastDotIndex === -1) {
      // 아직 '.'이 없음: 첫 번째 네임스페이스 제안
      // 예: "lo" → "login", "home" 등
      const prefix = input.toLowerCase();
      const uniquePrefixes = new Set<string>();

      existingKeys.forEach((key) => {
        const firstPart = key.split(".")[0];
        if (firstPart.toLowerCase().startsWith(prefix) && firstPart !== prefix) {
          uniquePrefixes.add(firstPart);
        }
      });

      return Array.from(uniquePrefixes).sort();
    } else {
      // '.' 이후 부분 제안
      // 예: "login." → "login.title", "login.button" 등
      const prefix = input.substring(0, lastDotIndex + 1).toLowerCase();
      const currentInput = input.substring(lastDotIndex + 1).toLowerCase();
      const uniqueSuggestions = new Set<string>();

      existingKeys.forEach((key) => {
        if (key.toLowerCase().startsWith(prefix)) {
          const remaining = key.substring(prefix.length);
          if (remaining && remaining.toLowerCase().startsWith(currentInput)) {
            // 다음 부분까지 추출 (예: "login." → "title", "button")
            const nextPart = remaining.split(".")[0];
            if (nextPart) {
              uniqueSuggestions.add(prefix + nextPart);
            }
          }
        }
      });

      return Array.from(uniqueSuggestions).sort();
    }
  }, [value, existingKeys]);

  // 입력값 변경 시
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  // 제안 선택
  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion + ".");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      } else if (e.key === "Enter") {
        // Cmd/Ctrl+Enter는 키 추가용이므로 제외
        if (e.metaKey || e.ctrlKey) {
          // 부모의 onKeyDown 호출 (키 추가 처리)
          onKeyDown?.(e);
          return;
        }
        // 일반 Enter: 선택된 제안이 있으면 그것을, 없으면 첫 번째 제안을 선택
        e.preventDefault();
        const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
        handleSelectSuggestion(suggestions[indexToSelect]);
        return;
      } else if (e.key === "Tab" && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
        return;
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }

    // 부모의 onKeyDown 호출
    onKeyDown?.(e);
  };

  // Input 포커스 시
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Input 블러 시 (약간의 지연으로 클릭 이벤트 처리)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // 선택된 제안으로 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn("font-mono text-sm h-9", className)}
        autoFocus={autoFocus}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                "px-3 py-2 text-sm font-mono cursor-pointer transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

