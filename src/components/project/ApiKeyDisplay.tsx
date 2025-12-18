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

  const nextjsCode = `// i18n.ts
import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import { initReactI18next } from 'react-i18next';

// API Route를 통해 프록시 (권장)
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/api/translations/{{ns}}/{{lng}}.json'
    },
    defaultNS: 'common',
    ns: ['common', 'login', 'home'],
    fallbackLng: 'en'
  });

// pages/api/translations/[ns]/[lng].json.ts
export default async function handler(req, res) {
  const { ns, lng } = req.query;
  const response = await fetch(
    \`${apiBaseUrl}/api/translations/\${ns}/\${lng}.json\`,
    {
      headers: {
        'x-api-key': process.env.VERBASYNC_API_KEY
      }
    }
  );
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
          API Key
        </CardTitle>
        <CardDescription>
          i18next-http-backend를 사용하여 Verbasync API에서 번역을 가져올 수
          있습니다. 로컬 JSON 파일 대신 실시간으로 번역을 동기화하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">API Key</Label>
            <Badge variant="secondary" className="text-xs">
              i18next 호환
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={displayValue}
              readOnly
              className="pr-24 font-mono text-sm"
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

        <div className="rounded-md bg-muted p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">
                React + i18next 설정
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => handleCopyCode(reactCode, "React i18next")}
              >
                {copiedCode === "React i18next" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="font-mono text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre">
              <code>{reactCode}</code>
            </pre>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Next.js (서버 사이드) 예시
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => handleCopyCode(nextjsCode, "Next.js i18next")}
              >
                {copiedCode === "Next.js i18next" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="font-mono text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre">
              <code>{nextjsCode}</code>
            </pre>
          </div>
        </div>

        <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>보안:</strong> 프로젝트 설정에서 허용된 도메인을 설정하면,
            해당 도메인에서만 API Key를 사용할 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
