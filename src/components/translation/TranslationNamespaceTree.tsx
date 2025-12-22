import { memo, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { TranslationKeyRow } from "./TranslationKeyRow";
import type { TranslationMatrix } from "@/types/api";
import type { Key } from "@/types/api";
import type { NamespaceNode } from "@/lib/translation-utils";
import { getAllKeysCount } from "@/lib/translation-utils";

interface TranslationNamespaceTreeProps {
  node: NamespaceNode;
  locales: TranslationMatrix["locales"];
  keys?: Key[];
  selectedKeys: Set<string>;
  editingKey: { key: string; name: string; description: string | null } | null;
  changes: Record<string, string>;
  collapsedGroups: Set<string>;
  onToggleGroup: (namespace: string) => void;
  onSelect: (key: string, checked: boolean) => void;
  onStartEdit: (key: string) => void;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string | null) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (key: string) => void;
  onCellChange: (key: string, locale: string, value: string) => void;
  isUpdatingKey: boolean;
  isDeletingKey: boolean;
  colSpan: number;
  canEdit?: boolean; // 편집 권한 여부 (VIEWER는 false)
}

function TranslationNamespaceTreeComponent({
  node,
  locales,
  keys,
  selectedKeys,
  editingKey,
  changes,
  collapsedGroups,
  onToggleGroup,
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
  colSpan,
  canEdit = true,
}: TranslationNamespaceTreeProps) {
  const isCollapsed = collapsedGroups.has(node.fullPath);
  const hasChildren = node.children.size > 0 || node.keys.length > 0;
  
  // allKeys 개수를 lazy evaluation으로 계산 (성능 최적화)
  const allKeysCount = useMemo(() => getAllKeysCount(node), [node]);

  return (
    <>
      {/* 그룹 헤더 */}
      <TableRow className="bg-muted/30 hover:bg-muted/40">
        <TableCell colSpan={colSpan} className="p-2">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${node.level * 20}px` }}
          >
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onToggleGroup(node.fullPath)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            <span className="font-semibold text-sm">
              {node.namespace}
            </span>
            <Badge variant="secondary" className="text-xs">
              {allKeysCount}개 키
            </Badge>
          </div>
        </TableCell>
      </TableRow>

      {/* 펼쳐진 경우에만 하위 내용 표시 */}
      {!isCollapsed && (
        <>
          {/* 현재 레벨의 키들 */}
          {node.keys.map((row) => {
            const keyData = keys?.find((k) => k.name === row.key);
            const isEditing = editingKey?.key === row.key;

            return (
              <TranslationKeyRow
                key={row.key}
                row={row}
                locales={locales}
                keyData={keyData}
                isSelected={selectedKeys.has(row.key)}
                isEditing={isEditing}
                editingName={editingKey?.name || ""}
                editingDescription={editingKey?.description || null}
                changes={changes}
                onSelect={(checked) => onSelect(row.key, checked)}
                onStartEdit={() => onStartEdit(row.key)}
                onEditNameChange={onEditNameChange}
                onEditDescriptionChange={onEditDescriptionChange}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onDelete={() => onDelete(row.key)}
                onCellChange={(locale, value) =>
                  onCellChange(row.key, locale, value)
                }
                isUpdatingKey={isUpdatingKey}
                isDeletingKey={isDeletingKey}
                canEdit={canEdit}
              />
            );
          })}

          {/* 하위 namespace들 (정렬된 순서로) */}
          {Array.from(node.children.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, childNode]) => (
              <TranslationNamespaceTree
                key={childNode.fullPath}
                node={childNode}
                locales={locales}
                keys={keys}
                selectedKeys={selectedKeys}
                editingKey={editingKey}
                changes={changes}
                collapsedGroups={collapsedGroups}
                onToggleGroup={onToggleGroup}
                onSelect={onSelect}
                onStartEdit={onStartEdit}
                onEditNameChange={onEditNameChange}
                onEditDescriptionChange={onEditDescriptionChange}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onDelete={onDelete}
                onCellChange={onCellChange}
                isUpdatingKey={isUpdatingKey}
                isDeletingKey={isDeletingKey}
                colSpan={colSpan}
                canEdit={canEdit}
              />
            ))}
        </>
      )}
    </>
  );
}

// React.memo로 불필요한 리렌더링 방지 (성능 최적화)
export const TranslationNamespaceTree = memo(TranslationNamespaceTreeComponent);

