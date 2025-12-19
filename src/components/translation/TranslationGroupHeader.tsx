import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

interface TranslationGroupHeaderProps {
  namespace: string;
  keyCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
  colSpan: number;
}

export function TranslationGroupHeader({
  namespace,
  keyCount,
  isCollapsed,
  onToggle,
  colSpan,
}: TranslationGroupHeaderProps) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/40">
      <TableCell colSpan={colSpan} className="p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggle}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-semibold text-sm">
            {namespace || "(root)"}
          </span>
          <Badge variant="secondary" className="text-xs">
            {keyCount}개 키
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  );
}

