import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Eye, EyeOff, Lock, Loader2, Package } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useProjectApiKey } from "@/hooks/useProjects";

interface ApiKeyDisplayProps {
  projectId: string;
}

interface CodeBlockProps {
  code: string;
  copyType: string;
  copiedCode: string | null;
  onCopy: (code: string, type: string) => void;
  copyLabel: string;
}

function CodeBlock({
  code,
  copyType,
  copiedCode,
  onCopy,
  copyLabel,
}: CodeBlockProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs cursor-pointer"
          onClick={() => onCopy(code, copyType)}
        >
          {copiedCode === copyType ? (
            <Check className="mr-1.5 h-3 w-3" />
          ) : (
            <Copy className="mr-1.5 h-3 w-3" />
          )}
          {copyLabel}
        </Button>
      </div>
      <pre className="font-mono text-[11px] bg-muted/50 p-4 rounded-lg border overflow-x-auto whitespace-pre leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
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

  // React SPA + i18next
  const reactSpaInstallCode = `npm install i18next react-i18next i18next-http-backend`;

  const reactSpaConfigCode = `// src/i18n.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko'],
    ns: ['common', 'home'],
    defaultNS: 'common',

    backend: {
      loadPath: \`\${import.meta.env.VITE_API_BASE_URL}/api/translations/{{ns}}/{{lng}}.json\`,
      requestOptions: {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      }
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;`;

  const reactSpaUsageCode = `import { useTranslation } from 'react-i18next';

export function SubmitButton() {
  const { t } = useTranslation('common');
  return <button>{t('submit')}</button>;
}`;

  // Next.js App Router + next-intl
  const nextAppRouterInstallCode = `npm install next-intl`;

  const nextAppRouterConfigCode = `// i18n.ts
import { getRequestConfig } from 'next-intl/server';

const namespaces = ['common', 'home'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const res = await fetch(
        \`\${process.env.API_BASE_URL}/api/translations/\${ns}/\${locale}.json\`,
        {
          headers: {
            'x-api-key': process.env.API_KEY!
          },
          next: { revalidate: 60 }
        }
      );

      if (!res.ok) {
        throw new Error(\`Failed to load \${ns}/\${locale}\`);
      }

      return [ns, await res.json()] as const;
    })
  );

  return {
    locale,
    messages: Object.fromEntries(entries)
  };
});`;

  const nextAppRouterProviderCode = `// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}`;

  const nextAppRouterServerUsageCode = `// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('home');
  return <h1>{t('title')}</h1>;
}`;

  const nextAppRouterClientUsageCode = `'use client';

import { useTranslations } from 'next-intl';

export function CTAButton() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}`;

  // Next.js Pages Router + next-intl
  const nextPagesRouterInstallCode = `npm install next-intl`;

  const nextPagesRouterConfigCode = `// pages/index.tsx
import { NextIntlProvider } from 'next-intl';

export async function getServerSideProps({ locale }: { locale: string }) {
  const namespaces = ['common', 'home'];

  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const res = await fetch(
        \`\${process.env.API_BASE_URL}/api/translations/\${ns}/\${locale}.json\`,
        {
          headers: {
            'x-api-key': process.env.API_KEY!
          }
        }
      );

      if (!res.ok) throw new Error('Translation load failed');

      return [ns, await res.json()] as const;
    })
  );

  return {
    props: {
      locale,
      messages: Object.fromEntries(entries)
    }
  };
}

export default function Page({ messages, locale }: any) {
  return (
    <NextIntlProvider messages={messages} locale={locale}>
      <h1>Hello</h1>
    </NextIntlProvider>
  );
}`;

  // Next.js + i18next (Client-side only)
  const nextI18nextInstallCode = `npm install i18next react-i18next i18next-http-backend`;

  const nextI18nextConfigCode = `// i18n.ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: \`\${process.env.NEXT_PUBLIC_API_BASE_URL}/api/translations/{{ns}}/{{lng}}.json\`,
      requestOptions: {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY
        }
      }
    }
  });`;

  const nextI18nextUsageCode = `'use client';

import { useTranslation } from 'react-i18next';

export function Label() {
  const { t } = useTranslation('common');
  return <span>{t('submit')}</span>;
}`;

  // 로딩 중이거나 에러가 나도 카드 표시 (로딩 상태 표시)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t("apiKey.integrationTitle")}
        </CardTitle>
        <CardDescription>{t("apiKey.integrationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 1. API Key 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {t("apiKey.projectApiKey")}
            </Label>
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

        {/* 통합 가이드는 모든 권한이 볼 수 있음 */}
        {!isError && (
          <>
            <Separator />

            {/* 통합 방법 선택 탭 */}
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {t("apiKey.integrationMethodTitle")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("apiKey.integrationMethodDescription")}
                </p>
              </div>

              <Tabs defaultValue="react-spa" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="react-spa" className="cursor-pointer">
                    React SPA
                  </TabsTrigger>
                  <TabsTrigger value="next-app" className="cursor-pointer">
                    Next.js App Router
                  </TabsTrigger>
                  <TabsTrigger value="next-pages" className="cursor-pointer">
                    Next.js Pages Router
                  </TabsTrigger>
                  <TabsTrigger value="next-i18next" className="cursor-pointer">
                    Next.js + i18next
                  </TabsTrigger>
                </TabsList>

                {/* React SPA + i18next */}
                <TabsContent value="react-spa" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-medium text-foreground">
                          {t("apiKey.installTitle")}
                        </p>
                      </div>
                      <CodeBlock
                        code={reactSpaInstallCode}
                        copyType="react-spa-install"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.configTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("apiKey.configDescription")}
                      </p>
                      <CodeBlock
                        code={reactSpaConfigCode}
                        copyType="react-spa-config"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.usageTitle")}
                      </p>
                      <CodeBlock
                        code={reactSpaUsageCode}
                        copyType="react-spa-usage"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Next.js App Router + next-intl */}
                <TabsContent value="next-app" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-medium text-foreground">
                          {t("apiKey.installTitle")}
                        </p>
                      </div>
                      <CodeBlock
                        code={nextAppRouterInstallCode}
                        copyType="next-app-install"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.configTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("apiKey.nextAppConfigDescription")}
                      </p>
                      <CodeBlock
                        code={nextAppRouterConfigCode}
                        copyType="next-app-config"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.providerTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("apiKey.providerDescription")}
                      </p>
                      <CodeBlock
                        code={nextAppRouterProviderCode}
                        copyType="next-app-provider"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.serverUsageTitle")}
                      </p>
                      <CodeBlock
                        code={nextAppRouterServerUsageCode}
                        copyType="next-app-server-usage"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.clientUsageTitle")}
                      </p>
                      <CodeBlock
                        code={nextAppRouterClientUsageCode}
                        copyType="next-app-client-usage"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Next.js Pages Router + next-intl */}
                <TabsContent value="next-pages" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-medium text-foreground">
                          {t("apiKey.installTitle")}
                        </p>
                      </div>
                      <CodeBlock
                        code={nextPagesRouterInstallCode}
                        copyType="next-pages-install"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.configTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("apiKey.nextPagesConfigDescription")}
                      </p>
                      <CodeBlock
                        code={nextPagesRouterConfigCode}
                        copyType="next-pages-config"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Next.js + i18next (Client-side only) */}
                <TabsContent value="next-i18next" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-medium text-foreground">
                          {t("apiKey.installTitle")}
                        </p>
                      </div>
                      <CodeBlock
                        code={nextI18nextInstallCode}
                        copyType="next-i18next-install"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.configTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("apiKey.nextI18nextConfigDescription")}
                      </p>
                      <CodeBlock
                        code={nextI18nextConfigCode}
                        copyType="next-i18next-config"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("apiKey.usageTitle")}
                      </p>
                      <CodeBlock
                        code={nextI18nextUsageCode}
                        copyType="next-i18next-usage"
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        copyLabel={t("apiKey.copyCode")}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 보안 안내 */}
            <Separator />

            <div className="space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 p-4">
                <div className="flex gap-3">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
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
