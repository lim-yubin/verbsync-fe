import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Save, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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

  // 키 수정 상태
  const [editingKey, setEditingKey] = useState<{
    key: string;
    name: string;
    description: string | null;
  } | null>(null);

  // 키 삭제 확인 다이얼로그
  const [deleteDialogKey, setDeleteDialogKey] = useState<string | null>(null);

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

  const hasChanges = Object.keys(changes).length > 0;

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

  // 정렬된 매트릭스 사용
  const displayMatrix = sortedMatrix || matrix;

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
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? "저장 중..."
                : hasChanges
                ? `저장 (${Object.keys(changes).length})`
                : "저장"}
            </Button>
          }
        />

        <div className="rounded-lg border bg-background overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-background z-10 border-r">
                  키
                </TableHead>
                {displayMatrix.locales.map((locale) => (
                  <TableHead key={locale.code} className="min-w-[250px]">
                    <div className="font-semibold">{locale.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {locale.code}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasNoKeys && !isAddingKey ? (
                <TableRow>
                  <TableCell
                    colSpan={matrix.locales.length + 1}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <p className="text-sm">아직 번역 키가 없습니다</p>
                    <p className="text-xs mt-1">
                      아래 버튼을 클릭하여 첫 번째 키를 추가하세요
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                displayMatrix.rows.map((row) => {
                  const keyData = keys?.find((k) => k.name === row.key);
                  const isEditing = editingKey?.key === row.key;

                  return (
                    <TableRow key={row.key}>
                      <TableCell className="sticky left-0 bg-background z-10 border-r min-w-[250px]">
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
                            className="p-2 max-w-[250px]"
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
                })
              )}

              {/* 새 키 추가 행 */}
              {isAddingKey && (
                <TableRow className="bg-muted/30 border-t-2 border-primary/20">
                  <TableCell className="sticky left-0 bg-muted/30 z-10 border-r">
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
                            Enter: 추가, Esc: 취소
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
        {!isAddingKey && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsAddingKey(true)}
              className="w-full max-w-md"
            >
              <Plus className="mr-2 h-4 w-4" />새 번역 키 추가
            </Button>
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
