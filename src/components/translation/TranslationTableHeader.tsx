import { Checkbox } from "@/components/ui/checkbox";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TranslationMatrix } from "@/types/api";

interface TranslationTableHeaderProps {
  locales: TranslationMatrix["locales"];
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

export function TranslationTableHeader({
  locales,
  selectedCount,
  totalCount,
  onSelectAll,
}: TranslationTableHeaderProps) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] sticky left-0 bg-background z-10 border-r">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            className="cursor-pointer"
          />
        </TableHead>
        <TableHead className="min-w-[300px] sticky left-0 bg-background z-10 border-r">
          키
        </TableHead>
        {locales.map((locale) => (
          <TableHead key={locale.code} className="min-w-[300px]">
            <div className="font-semibold">{locale.name}</div>
            <div className="text-xs text-muted-foreground font-normal">
              {locale.code}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

