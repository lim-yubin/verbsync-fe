import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Save, Trash2, Info, Plus, Upload } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { useProject } from "@/hooks/useProjects";
import { ExportButton } from "@/components/translation/ExportButton";
import { ImportDialog } from "@/components/translation/ImportDialog";
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
  groupKeysByNamespaceHierarchical,
  extractNamespaces,
  sortKeys,
} from "@/lib/translation-utils";
import {
  TranslationFilters,
  TranslationTableHeader,
  TranslationKeyRow,
  AddKeyRow,
  TranslationEmptyState,
  TranslationNamespaceTree,
} from "@/components/translation";

export function TranslationsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: project } = useProject(projectId!);
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

  // Import 다이얼로그 상태
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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

  // 그룹화된 매트릭스 (계층적)
  const groupedMatrixHierarchical = useMemo(() => {
    if (!filteredAndSortedMatrix || !groupByNamespace) {
      return null;
    }
    return groupKeysByNamespaceHierarchical(filteredAndSortedMatrix.rows);
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
    const trimmedKeyName = keyName.trim();

    if (!trimmedKeyName) {
      toast.error("키 이름을 입력해주세요");
      return;
    }

    // dot(.)이 없으면 namespace가 없는 키이므로 추가 불가
    if (!trimmedKeyName.includes(".")) {
      toast.error("키 이름은 namespace를 포함해야 합니다 (예: login.title)");
      return;
    }

    createKey(
      { name: trimmedKeyName, description: keyDescription.trim() || undefined },
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

  // Import 핸들러
  const handleImport = async (
    data: {
      keys: Array<{ name: string; description: string | null }>;
      translations: Array<{ key: string; locale: string; value: string }>;
    },
    mode: "merge" | "overwrite"
  ) => {
    // 1. 키 생성 (존재하지 않는 키만)
    const existingKeyNames = new Set(keys?.map((k) => k.name) || []);
    const newKeys = data.keys.filter((k) => !existingKeyNames.has(k.name));

    // 키 생성
    if (newKeys.length > 0) {
      await Promise.all(
        newKeys.map(
          (key) =>
            new Promise<void>((resolve, reject) => {
              createKey(
                {
                  name: key.name,
                  description: key.description || undefined,
                },
                {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error),
                }
              );
            })
        )
      );
    }

    // 2. 번역 업데이트
    let translationsToUpdate = data.translations;

    // 병합 모드인 경우: 기존 번역이 있는 경우 건너뛰기
    if (mode === "merge" && matrix) {
      const existingTranslations = new Set<string>();
      for (const row of matrix.rows) {
        for (const locale of matrix.locales) {
          const value = row.translations[locale.code];
          if (value && value.trim()) {
            existingTranslations.add(`${row.key}|${locale.code}`);
          }
        }
      }

      translationsToUpdate = data.translations.filter((t) => {
        const key = `${t.key}|${t.locale}`;
        return !existingTranslations.has(key);
      });
    }

    // 3. 번역 업데이트
    if (translationsToUpdate.length === 0) {
      toast.info("업데이트할 번역이 없습니다.");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      updateTranslations(
        { updates: translationsToUpdate },
        {
          onSuccess: () => {
            const keyMessage =
              newKeys.length > 0 ? `${newKeys.length}개 키 추가, ` : "";
            toast.success(
              `${keyMessage}${translationsToUpdate.length}개 번역 업데이트 완료`
            );
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

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
      <TranslationEmptyState
        type="no-keys"
        onAddLocale={() => window.history.back()}
      />
    );
  }

  // 언어가 없는 경우
  const hasNoLocales =
    !displayMatrix?.locales || displayMatrix.locales.length === 0;

  if (hasNoLocales) {
    return (
      <TranslationEmptyState
        type="no-locales"
        onAddLocale={() => window.history.back()}
      />
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
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  선택 삭제 ({selectedKeys.size})
                </Button>
              )}
              {displayMatrix && project && (
                <>
                  <ExportButton
                    matrix={displayMatrix}
                    projectName={project.name}
                    isFiltered={
                      !!searchQuery ||
                      selectedNamespaces.length > 0 ||
                      showEmptyOnly
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => setImportDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    가져오기
                  </Button>
                </>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="cursor-pointer"
              >
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
        <TranslationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          availableNamespaces={availableNamespaces}
          selectedNamespaces={selectedNamespaces}
          onNamespaceToggle={(namespace) => {
            setSelectedNamespaces((prev) =>
              prev.includes(namespace)
                ? prev.filter((n) => n !== namespace)
                : [...prev, namespace]
            );
          }}
          onNamespaceClear={() => setSelectedNamespaces([])}
          showEmptyOnly={showEmptyOnly}
          onShowEmptyOnlyChange={setShowEmptyOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          groupByNamespace={groupByNamespace}
          onGroupByNamespaceChange={setGroupByNamespace}
          filteredCount={displayMatrix.rows.length}
          isFiltered={
            !!searchQuery || selectedNamespaces.length > 0 || showEmptyOnly
          }
        />

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
            <TranslationTableHeader
              locales={displayMatrix.locales}
              selectedCount={selectedKeys.size}
              totalCount={displayMatrix.rows.length}
              onSelectAll={toggleSelectAll}
            />
            <TableBody>
              {groupByNamespace && groupedMatrixHierarchical
                ? // 계층적 그룹화된 렌더링
                  Array.from(groupedMatrixHierarchical.entries())
                    .sort(([a], [b]) => {
                      // (root) 그룹을 맨 위로
                      if (a === "(root)") return -1;
                      if (b === "(root)") return 1;
                      return a.localeCompare(b);
                    })
                    .map(([, rootNode]) => (
                      <TranslationNamespaceTree
                        key={rootNode.fullPath}
                        node={rootNode}
                        locales={displayMatrix.locales}
                        keys={keys}
                        selectedKeys={selectedKeys}
                        editingKey={editingKey}
                        changes={changes}
                        collapsedGroups={collapsedGroups}
                        onToggleGroup={toggleGroup}
                        onSelect={(key, checked) => {
                          if (checked) {
                            setSelectedKeys((prev) => new Set(prev).add(key));
                          } else {
                            setSelectedKeys((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(key);
                              return newSet;
                            });
                          }
                        }}
                        onStartEdit={handleStartEditKey}
                        onEditNameChange={(name) =>
                          setEditingKey((prev) =>
                            prev ? { ...prev, name } : null
                          )
                        }
                        onEditDescriptionChange={(description) =>
                          setEditingKey((prev) =>
                            prev ? { ...prev, description } : null
                          )
                        }
                        onSaveEdit={handleSaveEditKey}
                        onCancelEdit={handleCancelEditKey}
                        onDelete={(key) => setDeleteDialogKey(key)}
                        onCellChange={handleCellChange}
                        isUpdatingKey={isUpdatingKey}
                        isDeletingKey={isDeletingKey}
                        colSpan={displayMatrix.locales.length + 2}
                      />
                    ))
                : // 일반 렌더링 (그룹화 없음)
                  displayMatrix.rows.map((row) => {
                    const keyData = keys?.find((k) => k.name === row.key);
                    const isEditing = editingKey?.key === row.key;

                    return (
                      <TranslationKeyRow
                        key={row.key}
                        row={row}
                        locales={displayMatrix.locales}
                        keyData={keyData}
                        isSelected={selectedKeys.has(row.key)}
                        isEditing={isEditing}
                        editingName={editingKey?.name || ""}
                        editingDescription={editingKey?.description || null}
                        changes={changes}
                        onSelect={(checked) => {
                          if (checked) {
                            setSelectedKeys((prev) =>
                              new Set(prev).add(row.key)
                            );
                          } else {
                            setSelectedKeys((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(row.key);
                              return newSet;
                            });
                          }
                        }}
                        onStartEdit={() => handleStartEditKey(row.key)}
                        onEditNameChange={(name) =>
                          setEditingKey((prev) =>
                            prev ? { ...prev, name } : null
                          )
                        }
                        onEditDescriptionChange={(description) =>
                          setEditingKey((prev) =>
                            prev ? { ...prev, description } : null
                          )
                        }
                        onSaveEdit={handleSaveEditKey}
                        onCancelEdit={handleCancelEditKey}
                        onDelete={() => setDeleteDialogKey(row.key)}
                        onCellChange={(locale, value) =>
                          handleCellChange(row.key, locale, value)
                        }
                        isUpdatingKey={isUpdatingKey}
                        isDeletingKey={isDeletingKey}
                      />
                    );
                  })}

              {/* 새 키 추가 행 */}
              {isAddingKey && (
                <AddKeyRow
                  keyName={keyName}
                  keyDescription={keyDescription}
                  existingKeys={keys?.map((k) => k.name) || []}
                  locales={displayMatrix.locales}
                  isCreating={isCreatingKey}
                  onKeyNameChange={setKeyName}
                  onKeyDescriptionChange={setKeyDescription}
                  onAdd={handleAddKey}
                  onCancel={handleCancelAddKey}
                  onKeyDown={(e) => {
                    // Cmd+Enter (Mac) 또는 Ctrl+Enter (Windows)로 추가
                    const trimmedKeyName = keyName.trim();
                    if (
                      e.key === "Enter" &&
                      (e.metaKey || e.ctrlKey) &&
                      trimmedKeyName
                    ) {
                      e.preventDefault();
                      if (trimmedKeyName.includes(".")) {
                        handleAddKey();
                      } else {
                        toast.error(
                          "키 이름은 dot notation이어야 합니다 (예: login.title)"
                        );
                      }
                    } else if (e.key === "Escape") {
                      handleCancelAddKey();
                    }
                  }}
                />
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

        {/* Import 다이얼로그 */}
        {project && displayMatrix && (
          <ImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            onImport={handleImport}
            existingLocales={displayMatrix.locales.map((l) => ({
              code: l.code,
              name: l.name,
            }))}
            existingKeys={keys?.map((k) => k.name) || []}
          />
        )}
      </div>
    </AppLayout>
  );
}
