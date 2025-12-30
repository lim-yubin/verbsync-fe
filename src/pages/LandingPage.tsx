import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {t("common.appName")}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            >
              {t("auth.login")}
            </a>
            <Button asChild size="sm">
              <a href="/register" className="cursor-pointer">{t("landing.getStarted")}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            {t("landing.badge")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6 whitespace-pre-line">
            {t("landing.title")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 whitespace-pre-line">
            {t("landing.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href="/register" className="cursor-pointer">{t("landing.getStarted")}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/login" className="cursor-pointer">{t("auth.login")}</a>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-12 md:my-16" />

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 md:mb-16 text-gray-900 dark:text-gray-100">
            개발자를 위해 설계되었습니다
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-16">
            {/* Feature 1 */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                직관적인 편집
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                스프레드시트처럼 관리하세요
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                번역 키와 언어를 행과 열로 구성된 테이블에서 직접 편집할 수
                있습니다. 복잡한 인터페이스 없이, 필요한 것만 담았습니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                API 기반 배포
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                코드 한 줄로 연동하세요
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                프로젝트별 API Key를 발급받아 GET 요청 하나로 모든 번역 데이터를
                가져올 수 있습니다. 별도의 SDK나 설정이 필요 없습니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                실시간 업데이트
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                앱 재배포 없이 반영하세요
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                번역을 수정하면 즉시 API에 반영됩니다. 앱스토어 심사나 재배포를
                기다릴 필요가 없습니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                무제한 사용
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                제약 없이 확장하세요
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                프로젝트, 언어, 번역 키 개수에 제한이 없습니다. 팀 규모나
                프로젝트 크기에 상관없이 자유롭게 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12 md:my-16" />

      {/* Code Example Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            단 몇 줄이면 충분합니다
          </h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <pre className="text-xs sm:text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">
                {`// 1. API Key로 번역 데이터 가져오기
const response = await fetch(
  'https://api.verbsync.com/v1/{apiKey}/ko.json'
);
const translations = await response.json();

// 2. 바로 사용하기
console.log(translations['login.title']); // "로그인"`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <Separator className="my-12 md:my-16" />

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            가입은 무료이며, 신용카드 정보가 필요하지 않습니다
          </p>
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="text-base sm:text-lg px-8 py-6"
            >
              <a href="/register">무료로 시작하기 →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 md:py-12 mt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              © 2024 Verbsync. All rights reserved.
            </div>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                문서
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                API
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
