import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TranslationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  availableNamespaces: string[];
  selectedNamespaces: string[];
  onNamespaceToggle: (namespace: string) => void;
  onNamespaceClear: () => void;
  sortBy: "created" | "name" | "namespace";
  onSortByChange: (value: "created" | "name" | "namespace") => void;
  groupByNamespace: boolean;
  onGroupByNamespaceChange: (checked: boolean) => void;
  filteredCount: number;
  isFiltered: boolean;
}

export function TranslationFilters({
  searchQuery,
  onSearchChange,
  availableNamespaces,
  selectedNamespaces,
  onNamespaceToggle,
  onNamespaceClear,
  sortBy,
  onSortByChange,
  groupByNamespace,
  onGroupByNamespaceChange,
  filteredCount,
  isFiltered,
}: TranslationFiltersProps) {
  const { t } = useTranslation();
  // 최상위 namespace만 추출 (필터용)
  const rootNamespaces = useMemo(() => {
    const rootSet = new Set<string>();
    availableNamespaces.forEach((namespace) => {
      // 첫 번째 부분만 추출 (최상위 namespace)
      const rootNamespace = namespace.split(".")[0];
      rootSet.add(rootNamespace);
    });
    return Array.from(rootSet).sort();
  }, [availableNamespaces]);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* 검색 및 필터 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("filters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 정렬 및 그룹화 옵션 */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("filters.sort")}</span>
            <Select
              value={sortBy}
              onValueChange={(value: "created" | "name" | "namespace") =>
                onSortByChange(value)
              }
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">{t("filters.sortByCreated")}</SelectItem>
                <SelectItem value="name">{t("filters.sortByName")}</SelectItem>
                <SelectItem value="namespace">{t("filters.sortByNamespace")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 그룹화 토글 */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="groupByNamespace"
              checked={groupByNamespace}
              onCheckedChange={(checked) =>
                onGroupByNamespaceChange(checked === true)
              }
              className="cursor-pointer"
            />
            <label
              htmlFor="groupByNamespace"
              className="text-sm cursor-pointer"
            >
              {t("filters.groupByNamespace")}
            </label>
          </div>
          {/* Namespace 필터 */}
          {rootNamespaces.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t("filters.namespace")}
              </span>
              <div className="flex flex-wrap gap-2">
                {rootNamespaces.map((namespace) => {
                  const isSelected = selectedNamespaces.includes(namespace);
                  return (
                    <Badge
                      key={namespace}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onNamespaceToggle(namespace)}
                    >
                      {namespace}
                    </Badge>
                  );
                })}
                {selectedNamespaces.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs cursor-pointer"
                    onClick={onNamespaceClear}
                  >
                    {t("filters.clearAll")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 결과 개수 */}
          <div className="text-sm text-muted-foreground ml-auto">
            {t("filters.keyCount", { count: filteredCount })}{isFiltered ? t("filters.filtered") : ""}
          </div>
        </div>
      </div>
    </Card>
  );
}
