import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Save } from "lucide-react";
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
import { toast } from "sonner";
import { useTranslationMatrix, useUpdateTranslations } from "@/hooks/useTranslations";
import { EditableCell } from "@/components/translation/EditableCell";

export function TranslationsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: matrix, isLoading } = useTranslationMatrix(projectId!);
  const { mutate: updateTranslations, isPending: isSaving } = useUpdateTranslations(projectId!);

  // 변경사항 추적: "key|locale" -> "value"
  const [changes, setChanges] = useState<Record<string, string>>({});

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

  if (!matrix || matrix.rows.length === 0 || matrix.locales.length === 0) {
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
              {matrix.rows.map((row) => (
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
              ))}
            </TableBody>
          </Table>
        </div>

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

