import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useProjectApiKey } from "@/hooks/useProjects";

interface ApiKeyDisplayProps {
  projectId: string;
}

export function ApiKeyDisplay({ projectId }: ApiKeyDisplayProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useProjectApiKey(projectId);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiKey = data?.apiKey || "";

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success(t("apiKey.copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("apiKey.copyFailed"));
    }
  };

  const handleCopyCode = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast.success(t("apiKey.codeCopySuccess", { type }));
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error(t("apiKey.codeCopyFailed"));
    }
  };

  const displayValue = isLoading
    ? t("common.loading")
    : isVisible
    ? apiKey
    : "•".repeat(32);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://api.verbsync.com";

  const i18nextStandardCode = apiKey
    ? `// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      // Verbsync API 경로 설정
      loadPath: '${apiBaseUrl}/api/translations/{{ns}}/{{lng}}.json',
      // 헤더에 API Key 포함
      customHeaders: {
        'x-api-key': '${isVisible ? apiKey : "YOUR_API_KEY"}'
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    // ... 기타 i18next 설정
  });`
    : `// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      // Verbsync API 경로 설정
      loadPath: '${apiBaseUrl}/api/translations/{{ns}}/{{lng}}.json',
      // 헤더에 API Key 포함
      customHeaders: {
        'x-api-key': 'YOUR_API_KEY'
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    // ... 기타 i18next 설정
  });`;

  const componentUsageCode = `import { useTranslation } from 'react-i18next';

function WelcomeComponent() {
  // 사용할 네임스페이스들을 배열로 로드 (추천)
  const { t } = useTranslation(['home', 'common']);

  return (
    <div>
      {/* 1. 기본 네임스페이스('home')의 키 사용 */}
      <h1>{t('welcome')}</h1>
      
      {/* 2. 다른 네임스페이스('common')의 키를 명시적으로 사용 */}
      <button>{t('common:button.save')}</button>
    </div>
  );
}`;

  // 로딩 중이거나 에러가 나도 카드 표시 (로딩 상태 표시)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t("apiKey.title")}
        </CardTitle>
        <CardDescription>
          {t("apiKey.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 1. API Key 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t("apiKey.projectApiKey")}</Label>
            <Badge variant="outline" className="text-[10px] uppercase">
              {t("apiKey.secret")}
            </Badge>
          </div>
          {isError ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {t("apiKey.loadError")}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={displayValue}
                  readOnly
                  className="pr-24 font-mono text-sm bg-muted/30"
                />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => setIsVisible(!isVisible)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={handleCopy}
                  disabled={isLoading || !apiKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* i18next 연동 가이드는 모든 권한이 볼 수 있음 */}
        {!isError && (
          <>
            <Separator />

            {/* 2. 대시보드 세팅 가이드 */}
            <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t("apiKey.step1Title")}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("apiKey.step1Description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase">
                {t("apiKey.keyName")}
              </p>
              <code className="text-xs font-mono text-primary">
                home.welcome
              </code>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("apiKey.homeWelcome")}
              </p>
            </div>
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase">
                {t("apiKey.keyName")}
              </p>
              <code className="text-xs font-mono text-primary">
                common.button.save
              </code>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("apiKey.commonSave")}
              </p>
            </div>
          </div>
        </div>

        {/* 3. 연동 코드 섹션 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {t("apiKey.step2Title")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("apiKey.step2Description")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs cursor-pointer"
                onClick={() => handleCopyCode(i18nextStandardCode, "Standard")}
              >
                {copiedCode === "Standard" ? (
                  <Check className="mr-2 h-3 w-3" />
                ) : (
                  <Copy className="mr-2 h-3 w-3" />
                )}
                {t("apiKey.copyCode")}
              </Button>
            </div>
            <pre className="font-mono text-[11px] bg-muted/50 p-4 rounded-lg border overflow-x-auto whitespace-pre leading-relaxed">
              <code>{i18nextStandardCode}</code>
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {t("apiKey.step3Title")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("apiKey.step3Description")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs cursor-pointer"
                onClick={() => handleCopyCode(componentUsageCode, "Usage")}
              >
                {copiedCode === "Usage" ? (
                  <Check className="mr-2 h-3 w-3" />
                ) : (
                  <Copy className="mr-2 h-3 w-3" />
                )}
                {t("apiKey.copyCode")}
              </Button>
            </div>
            <pre className="font-mono text-[11px] bg-muted/50 p-4 rounded-lg border overflow-x-auto whitespace-pre leading-relaxed">
              <code>{componentUsageCode}</code>
            </pre>
          </div>
        </div>

        {/* 4. 보안 및 기타 안내 */}
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 p-4">
            <div className="flex gap-3">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                  {t("apiKey.securityTitle")}
                </p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-normal">
                  {t("apiKey.securityDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
