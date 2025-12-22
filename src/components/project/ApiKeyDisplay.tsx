import { useState } from "react";
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
import type { AxiosError } from "axios";

interface ApiKeyDisplayProps {
  projectId: string;
}

export function ApiKeyDisplay({ projectId }: ApiKeyDisplayProps) {
  const { data, isLoading, isError, error } = useProjectApiKey(projectId);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiKey = data?.apiKey || "";
  
  // 403 에러인 경우 (권한 없음) - 멤버는 API Key를 볼 수 없음
  const isForbidden = 
    isError && 
    error && 
    (error as AxiosError).response?.status === 403;

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API Key가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleCopyCode = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast.success(`${type} 코드가 복사되었습니다`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const displayValue = isLoading
    ? "Loading..."
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
          i18next 연동 및 사용 가이드
        </CardTitle>
        <CardDescription>
          Verbsync는 i18next와 완벽하게 호환됩니다. 아래 가이드를 따라 실시간
          번역 동기화를 시작하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 1. API Key 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">프로젝트 API Key</Label>
            <Badge variant="outline" className="text-[10px] uppercase">
              Secret
            </Badge>
          </div>
          {isForbidden ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                프로젝트 소유자만 API Key를 조회할 수 있습니다.
              </p>
            </div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                API Key를 불러올 수 없습니다.
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

        {!isError && !isForbidden && (
          <>
            <Separator />

            {/* 2. 대시보드 세팅 가이드 */}
            <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">1. 대시보드에 키 등록하기</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              점(<code>.</code>)을 사용하여 네임스페이스와 키를 구분합니다.
              i18next 설정의 <code>ns</code>(namespaces) 배열에 등록한 이름을 맨
              앞에 붙여주세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase">
                Key Name
              </p>
              <code className="text-xs font-mono text-primary">
                home.welcome
              </code>
              <p className="text-[10px] text-muted-foreground mt-1">
                홈 네임스페이스의 환영 문구
              </p>
            </div>
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase">
                Key Name
              </p>
              <code className="text-xs font-mono text-primary">
                common.button.save
              </code>
              <p className="text-[10px] text-muted-foreground mt-1">
                공통 네임스페이스의 저장 버튼
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
                  2. i18n.ts 설정 (표준 방식)
                </p>
                <p className="text-xs text-muted-foreground">
                  프로젝트 루트의 설정 파일에 아래 코드를 추가합니다.
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
                코드 복사
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
                  3. React 컴포넌트에서 사용
                </p>
                <p className="text-xs text-muted-foreground">
                  네임스페이스를 지정하여 번역을 불러옵니다.
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
                코드 복사
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
                  도메인 제한 필수
                </p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-normal">
                  브라우저에서 직접 호출할 경우, 반드시{" "}
                  <strong>프로젝트 설정 &gt; 도메인 제한</strong>에서 서비스
                  도메인을 등록하세요.
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
