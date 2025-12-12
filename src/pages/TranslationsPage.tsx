import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Save, Plus } from "lucide-react";
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
import { useTranslationMatrix, useUpdateTranslations } from "@/hooks/useTranslations";
import { useCreateKey } from "@/hooks/useKeys";
import { EditableCell } from "@/components/translation/EditableCell";

export function TranslationsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: matrix, isLoading, error } = useTranslationMatrix(projectId!);
  const { mutate: updateTranslations, isPending: isSaving } = useUpdateTranslations(projectId!);
  const { mutate: createKey, isPending: isCreatingKey } = useCreateKey(projectId!);

  // 변경사항 추적: "key|locale" -> "value"
  const [changes, setChanges] = useState<Record<string, string>>({});
  
  // 키 추가 (테이블 하단 행)
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [isAddingKey, setIsAddingKey] = useState(false);

  // 디버깅용 로그
  console.log("TranslationsPage Debug:", {
    projectId,
    isLoading,
    error,
    matrix,
    rowsCount: matrix?.rows?.length,
    localesCount: matrix?.locales?.length,
  });

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
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "저장에 실패했습니다");
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
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "키 추가에 실패했습니다");
        },
      }
    );
  };

  const handleCancelAddKey = () => {
    setKeyName("");
    setKeyDescription("");
    setIsAddingKey(false);
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
                {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
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
  const hasNoLocales = !matrix.locales || matrix.locales.length === 0;

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
  const hasNoKeys = !matrix.rows || matrix.rows.length === 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-full space-y-6">
        <PageHeader
          title="번역"
          description={`${matrix.rows.length}개 키 × ${matrix.locales.length}개 언어`}
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
                {matrix.locales.map((locale) => (
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
                    <p className="text-xs mt-1">아래 버튼을 클릭하여 첫 번째 키를 추가하세요</p>
                  </TableCell>
                </TableRow>
              ) : (
                matrix.rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                      <div className="font-mono text-sm font-semibold">
                        {row.key}
                      </div>
                      {row.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {row.description}
                        </div>
                      )}
                    </TableCell>
                    {matrix.locales.map((locale) => {
                      const changeKey = `${row.key}|${locale.code}`;
                      const currentValue =
                        changeKey in changes
                          ? changes[changeKey]
                          : row.translations[locale.code] || "";
                      const isModified = changeKey in changes;

                      return (
                        <TableCell key={locale.code} className="p-2">
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
                ))
              )}
              
              {/* 새 키 추가 행 */}
              {isAddingKey && (
                <TableRow className="bg-muted/30 border-t-2 border-primary/20">
                  <TableCell className="sticky left-0 bg-muted/30 z-10 border-r">
                    <div className="space-y-2">
                      <Input
                        placeholder="새 키 이름 (예: login.title)"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && keyName.trim() && !e.shiftKey) {
                            e.preventDefault();
                            handleAddKey();
                          } else if (e.key === "Escape") {
                            handleCancelAddKey();
                          }
                        }}
                        className="font-mono text-sm h-9"
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
                  {matrix.locales.map((locale) => (
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
              <Plus className="mr-2 h-4 w-4" />
              새 번역 키 추가
            </Button>
          </div>
        )}

        {hasChanges && (
          <div className="fixed bottom-6 right-6">
            <Button size="lg" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "저장 중..." : `${Object.keys(changes).length}개 저장`}
            </Button>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

