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

interface ApiKeyDisplayProps {
  projectId: string;
}

export function ApiKeyDisplay({ projectId }: ApiKeyDisplayProps) {
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
    import.meta.env.VITE_API_BASE_URL || "https://api.verbasync.com";

  const reactCode = `// i18n.ts
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '${apiBaseUrl}/api/translations/{{ns}}/{{lng}}.json',
      customHeaders: {
        'x-api-key': '${isVisible ? apiKey : "YOUR_API_KEY"}'
      }
    },
    defaultNS: 'common',
    ns: ['common', 'login', 'home'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });`;

  const i18nextStandardCode = `// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      // Verbasync API 경로 설정
      loadPath: '${apiBaseUrl}/api/translations/{{ns}}/{{lng}}.json',
      // 헤더에 API Key 포함
      customHeaders: {
        'x-api-key': '${isVisible ? apiKey : "YOUR_API_KEY"}'
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    // ... 기타 i18next 설정
  });`;

  const i18nextProxyCode = `// 1. 프론트엔드 설정 (i18n.ts)
i18n.use(Backend).init({
  backend: {
    // 내 서버의 API 경로로 설정 (API Key 노출 방지)
    loadPath: '/api/translations/{{ns}}/{{lng}}.json'
  }
});

// 2. 백엔드 프록시 예시 (Node.js/Next.js)
// GET /api/translations/:ns/:lng.json
export default async function handler(req, res) {
  const { ns, lng } = req.query;
  const response = await fetch(\`${apiBaseUrl}/api/translations/\${ns}/\${lng}.json\`, {
    headers: { 'x-api-key': process.env.VERBASYNC_API_KEY }
  });
  const data = await response.json();
  res.json(data);
}`;

  if (isError) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          i18next 연동 가이드
        </CardTitle>
        <CardDescription>
          Verbasync는 i18next와 완벽하게 호환됩니다. <code>i18next-http-backend</code>를 사용하여 실시간 번역 동기화를 시작하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">프로젝트 API Key</Label>
            <Badge variant="outline" className="text-[10px] uppercase">
              Secret
            </Badge>
          </div>
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
        </div>

        <Separator />

        {/* 연동 코드 섹션 */}
        <div className="space-y-6">
          {/* 표준 방식 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">기본 연동 방식 (추천)</p>
                <p className="text-xs text-muted-foreground">
                  클라이언트에서 직접 Verbasync API를 호출합니다.
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

          {/* 보안 방식 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">보안 강화 방식 (프록시)</p>
                <p className="text-xs text-muted-foreground">
                  API Key 노출을 방지하기 위해 자체 서버를 경유합니다.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs cursor-pointer"
                onClick={() => handleCopyCode(i18nextProxyCode, "Proxy")}
              >
                {copiedCode === "Proxy" ? (
                  <Check className="mr-2 h-3 w-3" />
                ) : (
                  <Copy className="mr-2 h-3 w-3" />
                )}
                코드 복사
              </Button>
            </div>
            <pre className="font-mono text-[11px] bg-muted/50 p-4 rounded-lg border overflow-x-auto whitespace-pre leading-relaxed">
              <code>{i18nextProxyCode}</code>
            </pre>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 p-4">
          <div className="flex gap-3">
            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                보안 권장사항
              </p>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-normal">
                기본 연동 방식을 사용할 경우, 반드시 <strong>프로젝트 설정 &gt; 도메인 제한</strong>에서 
                서비스의 도메인을 등록하세요. 이를 통해 허용되지 않은 도메인에서의 API Key 도용을 방지할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
