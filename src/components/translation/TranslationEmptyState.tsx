import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";

interface TranslationEmptyStateProps {
  type: "no-locales" | "no-keys";
  onAddLocale?: () => void;
}

export function TranslationEmptyState({
  type,
  onAddLocale,
}: TranslationEmptyStateProps) {
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
              {type === "no-locales"
                ? "먼저 언어를 추가해주세요"
                : "먼저 언어와 번역 키를 추가해주세요"}
            </p>
            {onAddLocale && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={onAddLocale}>
                  언어 추가하기
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

