import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Save,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Info,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useTranslationMatrix,
  useUpdateTranslations,
} from "@/hooks/useTranslations";
import {
  useCreateKey,
  useKeys,
  useUpdateKey,
  useDeleteKey,
} from "@/hooks/useKeys";
import { EditableCell } from "@/components/translation/EditableCell";
import { KeyAutocomplete } from "@/components/translation/KeyAutocomplete";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  filterKeys,
  groupKeysByNamespace,
  extractNamespaces,
  sortKeys,
} from "@/lib/translation-utils";

export function TranslationsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: matrix, isLoading, error } = useTranslationMatrix(projectId!);
  const { data: keys } = useKeys(projectId!); // 키 목록 (createdAt 포함)
  const { mutate: updateTranslations, isPending: isSaving } =
    useUpdateTranslations(projectId!);
  const { mutate: createKey, isPending: isCreatingKey } = useCreateKey(
    projectId!
  );
  const { mutate: updateKey, isPending: isUpdatingKey } = useUpdateKey(
    projectId!
  );
  const { mutate: deleteKey, isPending: isDeletingKey } = useDeleteKey(
    projectId!
  );

  // 변경사항 추적: "key|locale" -> "value"
  const [changes, setChanges] = useState<Record<string, string>>({});

  // 키 추가 (테이블 하단 행)
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [isAddingKey, setIsAddingKey] = useState(false);

  // 번역 키가 없을 때 자동으로 추가 모드 활성화
  useEffect(() => {
    if (matrix && (!matrix.rows || matrix.rows.length === 0) && !isAddingKey) {
      setIsAddingKey(true);
    }
  }, [matrix, isAddingKey]);

  // 키 수정 상태
  const [editingKey, setEditingKey] = useState<{
    key: string;
    name: string;
    description: string | null;
  } | null>(null);

  // 키 삭제 확인 다이얼로그
  const [deleteDialogKey, setDeleteDialogKey] = useState<string | null>(null);

  // 행 선택 상태
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] =
    useState(false);

  // 필터링 및 그룹화 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [groupByNamespace, setGroupByNamespace] = useState(true);
  const [sortBy, setSortBy] = useState<"created" | "name" | "namespace">(
    "created"
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // 키를 생성일 순으로 정렬된 매트릭스
  const sortedMatrix = useMemo(() => {
    if (!matrix || !keys) return matrix;

    // 키를 생성일 순으로 정렬 (오래된 것부터)
    const sortedKeys = [...keys].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 정렬된 키 순서대로 rows 재정렬
    const sortedRows = sortedKeys
      .map((key) => matrix.rows.find((row) => row.key === key.name))
      .filter((row): row is NonNullable<typeof row> => row !== undefined);

    return {
      ...matrix,
      rows: sortedRows,
    };
  }, [matrix, keys]);

  // 필터링 및 정렬된 매트릭스
  const filteredAndSortedMatrix = useMemo(() => {
    if (!sortedMatrix) return null;

    // 필터링
    let filtered = filterKeys(sortedMatrix.rows, {
      searchQuery,
      selectedNamespaces:
        selectedNamespaces.length > 0 ? selectedNamespaces : undefined,
      showEmptyOnly,
    });

    // 정렬
    filtered = sortKeys(filtered, sortBy, keys);

    return {
      ...sortedMatrix,
      rows: filtered,
    };
  }, [
    sortedMatrix,
    searchQuery,
    selectedNamespaces,
    showEmptyOnly,
    sortBy,
    keys,
  ]);

  // Namespace 목록 추출
  const availableNamespaces = useMemo(() => {
    if (!sortedMatrix) return [];
    return extractNamespaces(sortedMatrix.rows);
  }, [sortedMatrix]);

  // 그룹화된 매트릭스
  const groupedMatrix = useMemo(() => {
    if (!filteredAndSortedMatrix || !groupByNamespace) {
      return null;
    }
    return groupKeysByNamespace(filteredAndSortedMatrix.rows);
  }, [filteredAndSortedMatrix, groupByNamespace]);

  // 그룹 접기/펼치기 토글
  const toggleGroup = (namespace: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(namespace)) {
        newSet.delete(namespace);
      } else {
        newSet.add(namespace);
      }
      return newSet;
    });
  };

  const handleCellChange = (key: string, locale: string, value: string) => {
    const changeKey = `${key}|${locale}`;
    setChanges((prev) => ({
      ...prev,
      [changeKey]: value,
    }));
  };

  const handleSave = () => {
    const updates = Object.entries(changes).map(([changeKey, value]) => {
      const [key, locale] = changeKey.split("|");
      return { key, locale, value };
    });

    if (updates.length === 0) {
      toast.info("변경사항이 없습니다");
      return;
    }

    updateTranslations(
      { updates },
      {
        onSuccess: () => {
          toast.success(`${updates.length}개의 번역이 저장되었습니다`);
          setChanges({});
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "저장에 실패했습니다"
          );
        },
      }
    );
  };

  const handleAddKey = () => {
    if (!keyName.trim()) {
      toast.error("키 이름을 입력해주세요");
      return;
    }

    createKey(
      { name: keyName.trim(), description: keyDescription.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("번역 키가 추가되었습니다");
          setKeyName("");
          setKeyDescription("");
          setIsAddingKey(false);
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "키 추가에 실패했습니다"
          );
        },
      }
    );
  };

  const handleCancelAddKey = () => {
    setKeyName("");
    setKeyDescription("");
    setIsAddingKey(false);
  };

  // 키보드 단축키: Cmd/Ctrl+Shift+Enter로 새 키 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+Enter (Mac) 또는 Ctrl+Shift+Enter (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Enter") {
        // 입력 필드에 포커스가 있으면 기본 동작 허용
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        if (!isAddingKey) {
          setIsAddingKey(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddingKey]);

  const handleStartEditKey = (key: string) => {
    const keyData = keys?.find((k) => k.name === key);
    if (keyData) {
      setEditingKey({
        key: keyData.name,
        name: keyData.name,
        description: keyData.description,
      });
    }
  };

  const handleSaveEditKey = () => {
    if (!editingKey) return;

    const keyData = keys?.find((k) => k.name === editingKey.key);
    if (!keyData) return;

    // 변경사항이 없으면 취소
    if (
      editingKey.name === keyData.name &&
      editingKey.description === keyData.description
    ) {
      setEditingKey(null);
      return;
    }

    updateKey(
      {
        keyId: keyData.id,
        dto: {
          name: editingKey.name !== keyData.name ? editingKey.name : undefined,
          description:
            editingKey.description !== keyData.description
              ? editingKey.description
              : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("번역 키가 수정되었습니다");
          setEditingKey(null);
        },
        onError: (error: Error) => {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "키 수정에 실패했습니다"
          );
        },
      }
    );
  };

  const handleCancelEditKey = () => {
    setEditingKey(null);
  };

  const handleDeleteKey = () => {
    if (!deleteDialogKey) return;

    const keyData = keys?.find((k) => k.name === deleteDialogKey);
    if (!keyData) return;

    deleteKey(keyData.id, {
      onSuccess: () => {
        toast.success("번역 키가 삭제되었습니다");
        setDeleteDialogKey(null);
      },
      onError: (error: Error) => {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "키 삭제에 실패했습니다"
        );
      },
    });
  };

  // 행 선택 관련 함수들
  const toggleKeySelection = (key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (!displayMatrix?.rows) return;

    if (selectedKeys.size === displayMatrix.rows.length) {
      // 모두 선택되어 있으면 모두 해제
      setSelectedKeys(new Set());
    } else {
      // 모두 선택
      setSelectedKeys(new Set(displayMatrix.rows.map((row) => row.key)));
    }
  };

  const handleDeleteSelectedKeys = () => {
    if (selectedKeys.size === 0) return;

    const keysToDelete = Array.from(selectedKeys)
      .map((keyName) => keys?.find((k) => k.name === keyName))
      .filter((k): k is NonNullable<typeof k> => k !== undefined);

    if (keysToDelete.length === 0) return;

    // 순차적으로 삭제
    let completed = 0;
    let failed = 0;

    keysToDelete.forEach((keyData) => {
      deleteKey(keyData.id, {
        onSuccess: () => {
          completed++;
          if (completed + failed === keysToDelete.length) {
            if (failed === 0) {
              toast.success(`${completed}개의 번역 키가 삭제되었습니다`);
            } else {
              toast.warning(
                `${completed}개 삭제 완료, ${failed}개 실패했습니다`
              );
            }
            setSelectedKeys(new Set());
            setDeleteSelectedDialogOpen(false);
          }
        },
        onError: () => {
          failed++;
          if (completed + failed === keysToDelete.length) {
            if (completed > 0) {
              toast.warning(
                `${completed}개 삭제 완료, ${failed}개 실패했습니다`
              );
            } else {
              toast.error("키 삭제에 실패했습니다");
            }
            setSelectedKeys(new Set());
            setDeleteSelectedDialogOpen(false);
          }
        },
      });
    });
  };

  const hasChanges = Object.keys(changes).length > 0;

  // 표시할 매트릭스 결정
  const displayMatrix = filteredAndSortedMatrix || sortedMatrix || matrix;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-full space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="번역"
            description="번역 테이블에서 모든 번역을 관리하세요"
          />
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2 text-destructive">
                데이터를 불러올 수 없습니다
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다"}
              </p>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // 데이터가 없거나 비어있는 경우
  if (!matrix) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="번역"
            description="번역 테이블에서 모든 번역을 관리하세요"
          />
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">번역을 시작하려면</p>
              <p className="text-sm text-muted-foreground mb-4">
                먼저 언어와 번역 키를 추가해주세요
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>
                  언어 추가하기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // 언어가 없는 경우
  const hasNoLocales =
    !displayMatrix?.locales || displayMatrix.locales.length === 0;

  if (hasNoLocales) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="번역"
            description="번역 테이블에서 모든 번역을 관리하세요"
          />
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">번역을 시작하려면</p>
              <p className="text-sm text-muted-foreground mb-4">
                먼저 언어를 추가해주세요
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>
                  언어 추가하기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // 키가 없는 경우도 테이블 구조는 보여주기 (하단에 추가 행 포함)
  const hasNoKeys = !displayMatrix?.rows || displayMatrix.rows.length === 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-full space-y-6">
        <PageHeader
          title="번역"
          description={`${displayMatrix.rows.length}개 키 × ${displayMatrix.locales.length}개 언어`}
          action={
            <div className="flex items-center gap-2">
              {selectedKeys.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteSelectedDialogOpen(true)}
                  disabled={isDeletingKey}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  선택 삭제 ({selectedKeys.size})
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving
                  ? "저장 중..."
                  : hasChanges
                  ? `저장 (${Object.keys(changes).length})`
                  : "저장"}
              </Button>
            </div>
          }
        />

        {/* 필터 바 */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            {/* 검색 및 필터 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 검색 */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="키 이름, namespace, 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Namespace 필터 */}
              {availableNamespaces.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Namespace:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableNamespaces.map((namespace) => {
                      const isSelected = selectedNamespaces.includes(namespace);
                      return (
                        <Badge
                          key={namespace}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedNamespaces((prev) =>
                              isSelected
                                ? prev.filter((n) => n !== namespace)
                                : [...prev, namespace]
                            );
                          }}
                        >
                          {namespace}
                        </Badge>
                      );
                    })}
                    {selectedNamespaces.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setSelectedNamespaces([])}
                      >
                        모두 해제
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* 빈 번역 필터 */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showEmptyOnly"
                  checked={showEmptyOnly}
                  onCheckedChange={(checked) =>
                    setShowEmptyOnly(checked === true)
                  }
                  className="cursor-pointer"
                />
                <label
                  htmlFor="showEmptyOnly"
                  className="text-sm cursor-pointer"
                >
                  빈 번역만
                </label>
              </div>
            </div>

            {/* 정렬 및 그룹화 옵션 */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* 정렬 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">정렬:</span>
                <Select
                  value={sortBy}
                  onValueChange={(value: "created" | "name" | "namespace") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">생성일순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                    <SelectItem value="namespace">Namespace순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 그룹화 토글 */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="groupByNamespace"
                  checked={groupByNamespace}
                  onCheckedChange={(checked) =>
                    setGroupByNamespace(checked === true)
                  }
                  className="cursor-pointer"
                />
                <label
                  htmlFor="groupByNamespace"
                  className="text-sm cursor-pointer"
                >
                  Namespace별 그룹화
                </label>
              </div>

              {/* 결과 개수 */}
              <div className="text-sm text-muted-foreground ml-auto">
                {displayMatrix.rows.length}개 키
                {searchQuery || selectedNamespaces.length > 0 || showEmptyOnly
                  ? ` (필터링됨)`
                  : ""}
              </div>
            </div>
          </div>
        </Card>

        {/* 사용 안내 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>셀을 더블클릭하여 번역을 편집할 수 있습니다</span>
        </div>

        <div
          className={cn(
            "rounded-lg border bg-background",
            isAddingKey ? "overflow-x-hidden overflow-y-auto" : "overflow-auto"
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sticky left-0 bg-background z-10 border-r">
                  <Checkbox
                    checked={
                      displayMatrix.rows.length > 0 &&
                      selectedKeys.size === displayMatrix.rows.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </TableHead>
                <TableHead className="min-w-[300px] sticky left-0 bg-background z-10 border-r">
                  키
                </TableHead>
                {displayMatrix.locales.map((locale) => (
                  <TableHead key={locale.code} className="min-w-[300px]">
                    <div className="font-semibold">{locale.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {locale.code}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupByNamespace && groupedMatrix
                ? // 그룹화된 렌더링
                  Array.from(groupedMatrix.entries())
                    .sort(([a], [b]) => {
                      // (root) 그룹을 맨 위로
                      if (a === "(root)") return -1;
                      if (b === "(root)") return 1;
                      return a.localeCompare(b);
                    })
                    .map(([namespace, rows]) => {
                      const isCollapsed = collapsedGroups.has(namespace);
                      const groupKeyCount = rows.length;

                      return (
                        <React.Fragment key={namespace}>
                          {/* 그룹 헤더 */}
                          <TableRow className="bg-muted/30 hover:bg-muted/40">
                            <TableCell
                              colSpan={displayMatrix.locales.length + 2}
                              className="p-2"
                            >
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleGroup(namespace)}
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
                                  {groupKeyCount}개 키
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* 그룹 내 키들 */}
                          {!isCollapsed &&
                            rows.map((row) => {
                              const keyData = keys?.find(
                                (k) => k.name === row.key
                              );
                              const isEditing = editingKey?.key === row.key;

                              return (
                                <TableRow
                                  key={row.key}
                                  className={cn(
                                    selectedKeys.has(row.key) && "bg-accent/50"
                                  )}
                                >
                                  <TableCell className="sticky left-0 bg-background z-10 border-r w-[50px]">
                                    <Checkbox
                                      checked={selectedKeys.has(row.key)}
                                      onCheckedChange={() =>
                                        toggleKeySelection(row.key)
                                      }
                                      className="cursor-pointer"
                                    />
                                  </TableCell>
                                  <TableCell className="sticky left-0 bg-background z-10 border-r min-w-[300px]">
                                    {isEditing && keyData ? (
                                      <div className="space-y-2">
                                        <Input
                                          value={editingKey.name}
                                          onChange={(e) =>
                                            setEditingKey({
                                              ...editingKey,
                                              name: e.target.value,
                                            })
                                          }
                                          className="font-mono text-sm h-8"
                                          placeholder="키 이름"
                                        />
                                        <Textarea
                                          value={editingKey.description || ""}
                                          onChange={(e) =>
                                            setEditingKey({
                                              ...editingKey,
                                              description:
                                                e.target.value || null,
                                            })
                                          }
                                          placeholder="설명 (선택)"
                                          rows={2}
                                          className="text-xs resize-none"
                                        />
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleSaveEditKey}
                                            disabled={isUpdatingKey}
                                            className="h-7 px-2"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancelEditKey}
                                            disabled={isUpdatingKey}
                                            className="h-7 px-2"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="group relative">
                                        <div className="font-mono text-sm font-semibold">
                                          {row.key}
                                        </div>
                                        {row.description && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {row.description}
                                          </div>
                                        )}
                                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              handleStartEditKey(row.key)
                                            }
                                            disabled={isDeletingKey}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              setDeleteDialogKey(row.key)
                                            }
                                            disabled={isDeletingKey}
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </TableCell>
                                  {displayMatrix.locales.map((locale) => {
                                    const changeKey = `${row.key}|${locale.code}`;
                                    const currentValue =
                                      changeKey in changes
                                        ? changes[changeKey]
                                        : row.translations[locale.code] || "";
                                    const isModified = changeKey in changes;

                                    return (
                                      <TableCell
                                        key={locale.code}
                                        className="p-2 max-w-[300px]"
                                      >
                                        <EditableCell
                                          value={currentValue}
                                          onChange={(value) =>
                                            handleCellChange(
                                              row.key,
                                              locale.code,
                                              value
                                            )
                                          }
                                          isModified={isModified}
                                        />
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                        </React.Fragment>
                      );
                    })
                : // 일반 렌더링 (그룹화 없음)
                  displayMatrix.rows.map((row) => {
                    const keyData = keys?.find((k) => k.name === row.key);
                    const isEditing = editingKey?.key === row.key;

                    return (
                      <TableRow
                        key={row.key}
                        className={cn(
                          selectedKeys.has(row.key) && "bg-accent/50"
                        )}
                      >
                        <TableCell className="sticky left-0 bg-background z-10 border-r w-[50px]">
                          <Checkbox
                            checked={selectedKeys.has(row.key)}
                            onCheckedChange={() => toggleKeySelection(row.key)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="sticky left-0 bg-background z-10 border-r min-w-[300px]">
                          {isEditing && keyData ? (
                            <div className="space-y-2">
                              <Input
                                value={editingKey.name}
                                onChange={(e) =>
                                  setEditingKey({
                                    ...editingKey,
                                    name: e.target.value,
                                  })
                                }
                                className="font-mono text-sm h-8"
                                placeholder="키 이름"
                              />
                              <Textarea
                                value={editingKey.description || ""}
                                onChange={(e) =>
                                  setEditingKey({
                                    ...editingKey,
                                    description: e.target.value || null,
                                  })
                                }
                                placeholder="설명 (선택)"
                                rows={2}
                                className="text-xs resize-none"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSaveEditKey}
                                  disabled={isUpdatingKey}
                                  className="h-7 px-2"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditKey}
                                  disabled={isUpdatingKey}
                                  className="h-7 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative">
                              <div className="font-mono text-sm font-semibold">
                                {row.key}
                              </div>
                              {row.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {row.description}
                                </div>
                              )}
                              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartEditKey(row.key)}
                                  disabled={isDeletingKey}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteDialogKey(row.key)}
                                  disabled={isDeletingKey}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        {displayMatrix.locales.map((locale) => {
                          const changeKey = `${row.key}|${locale.code}`;
                          const currentValue =
                            changeKey in changes
                              ? changes[changeKey]
                              : row.translations[locale.code] || "";
                          const isModified = changeKey in changes;

                          return (
                            <TableCell
                              key={locale.code}
                              className="p-2 max-w-[300px]"
                            >
                              <EditableCell
                                value={currentValue}
                                onChange={(value) =>
                                  handleCellChange(row.key, locale.code, value)
                                }
                                isModified={isModified}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

              {/* 새 키 추가 행 */}
              {isAddingKey && (
                <TableRow className="bg-muted/30 border-t-2 border-primary/20">
                  <TableCell className="sticky left-0 bg-muted/30 z-10 border-r w-[50px]">
                    {/* 체크박스 셀은 비워둠 */}
                  </TableCell>
                  <TableCell className="sticky left-0 bg-background z-10 border-r">
                    <div className="space-y-2">
                      <KeyAutocomplete
                        value={keyName}
                        onChange={setKeyName}
                        existingKeys={keys?.map((k) => k.name) || []}
                        placeholder="새 키 이름 (예: login.title)"
                        onKeyDown={(e) => {
                          // Cmd+Enter (Mac) 또는 Ctrl+Enter (Windows)로 추가
                          if (
                            e.key === "Enter" &&
                            (e.metaKey || e.ctrlKey) &&
                            keyName.trim()
                          ) {
                            e.preventDefault();
                            handleAddKey();
                          } else if (e.key === "Escape") {
                            handleCancelAddKey();
                          }
                        }}
                        autoFocus
                      />
                      <Textarea
                        placeholder="설명 (선택)"
                        value={keyDescription}
                        onChange={(e) => setKeyDescription(e.target.value)}
                        onKeyDown={(e) => {
                          // Cmd+Enter (Mac) 또는 Ctrl+Enter (Windows)로 추가
                          if (
                            e.key === "Enter" &&
                            (e.metaKey || e.ctrlKey) &&
                            keyName.trim()
                          ) {
                            e.preventDefault();
                            handleAddKey();
                          }
                        }}
                        rows={2}
                        className="text-xs resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddKey}
                          disabled={isCreatingKey || !keyName.trim()}
                          className="h-7"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {isCreatingKey ? "추가 중..." : "추가"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelAddKey}
                          disabled={isCreatingKey}
                          className="h-7"
                        >
                          취소
                        </Button>
                        {keyName && (
                          <span className="text-xs text-muted-foreground">
                            {navigator.platform.includes("Mac") ||
                            navigator.userAgent.includes("Mac")
                              ? "Cmd+Enter"
                              : "Ctrl+Enter"}
                            : 추가, Esc: 취소
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  {displayMatrix.locales.map((locale) => (
                    <TableCell key={locale.code} className="p-2">
                      <div className="min-h-[60px] p-3 rounded bg-muted/50 flex items-center justify-center border-2 border-dashed">
                        <span className="text-xs text-muted-foreground italic">
                          키 추가 후 번역 가능
                        </span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 새 키 추가 버튼 */}
        {!isAddingKey && !hasNoKeys && (
          <div className="flex flex-col items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsAddingKey(true)}
              className="w-full max-w-md"
            >
              <Plus className="mr-2 h-4 w-4" />새 번역 키 추가
            </Button>
            <span className="text-xs text-muted-foreground">
              {navigator.platform.includes("Mac") ||
              navigator.userAgent.includes("Mac")
                ? "Cmd+Shift+Enter"
                : "Ctrl+Shift+Enter"}
              로 빠르게 추가
            </span>
          </div>
        )}

        {hasChanges && (
          <div className="fixed bottom-6 right-6">
            <Button size="lg" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-5 w-5" />
              {isSaving
                ? "저장 중..."
                : `${Object.keys(changes).length}개 저장`}
            </Button>
          </div>
        )}

        {/* 선택된 키 일괄 삭제 확인 다이얼로그 */}
        <AlertDialog
          open={deleteSelectedDialogOpen}
          onOpenChange={setDeleteSelectedDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>선택한 키 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                선택한 {selectedKeys.size}개의 번역 키를 삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelectedKeys}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 키 삭제 확인 다이얼로그 */}
        <AlertDialog
          open={deleteDialogKey !== null}
          onOpenChange={(open) => !open && setDeleteDialogKey(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>번역 키 삭제 확인</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-mono font-semibold">
                  {deleteDialogKey}
                </span>{" "}
                키를 삭제하시겠습니까?
                <br />
                <br />이 작업은 되돌릴 수 없으며, 해당 키의 모든 번역 데이터가
                영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingKey}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteKey}
                disabled={isDeletingKey}
              >
                {isDeletingKey ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
