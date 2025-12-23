import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">환불 정책</h1>
        <p className="text-muted-foreground mb-12">
          최종 수정일:{" "}
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. 총칙</h2>
            <p className="text-muted-foreground leading-relaxed">
              Verbsync 유료 플랜(Starter, Pro, Enterprise)의 모든 구매는{" "}
              <strong className="text-foreground">Paddle.com</strong>을 통해
              처리되며, Paddle은 모든 거래에 대한{" "}
              <strong className="text-foreground">
                Merchant of Record(판매자 대행)
              </strong>
              로 작동합니다.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              환불은 Paddle의 Buyer Terms(구매자 약관)에 따라 처리됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. 소비자 취소 권리
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                <p className="text-lg font-semibold text-foreground mb-2">
                  14일 이내 전액 환불 보장
                </p>
                <p className="leading-relaxed">
                  소비자인 경우, 구매 완료일로부터{" "}
                  <strong className="text-foreground">14일 이내</strong>에
                  구매를 취소하고{" "}
                  <strong className="text-foreground">전액 환불</strong>을
                  받을 수 있는 권리가 있습니다. 별도의 사유 없이도 환불이
                  가능합니다.
                </p>
              </div>
              <p className="leading-relaxed">
                이 14일 취소 기간은 구매가 완료된 다음 날부터 시작됩니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 환불 처리</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                모든 환불 요청은{" "}
                <strong className="text-foreground">Paddle</strong>에서
                처리합니다.
              </p>
              <p>
                14일 기간 내에 유효한 환불 요청이 제출되면, Paddle은 Paddle의
                Buyer Terms에 따라
                <strong className="text-foreground"> 14일 이내</strong>에 원래
                결제 수단으로 환불을 처리합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 환불 요청 방법</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                환불을 요청하시려면 구매 영수증 이메일에 포함된 환불 링크를
                사용하거나, 다음 주소로 직접 Paddle에 문의해주세요:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">
                  Paddle 고객 지원
                </p>
                <p>
                  웹사이트:{" "}
                  <a
                    href="https://paddle.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline cursor-pointer"
                  >
                    https://paddle.net
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. 14일 기간 경과 후
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              14일 취소 기간이 경과한 후 제출된 환불 요청은 보장되지 않으며,
              Paddle의 재량에 따라 검토될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 추가 정보</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>더 자세한 정보는 Paddle의 Buyer Terms를 참조해주세요:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <a
                  href="https://www.paddle.com/legal/invoiced-consumer-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all cursor-pointer"
                >
                  https://www.paddle.com/legal/invoiced-consumer-terms
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. 문의</h2>
            <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-muted-foreground">
              <p>환불 관련 문의사항이 있으시면 아래로 연락해주세요:</p>
              <div>
                <p className="font-semibold text-foreground mb-2">
                  Verbsync 고객 지원
                </p>
                <p>이메일: verbsync@gmail.com</p>
                <p className="mt-2">응답 시간: 영업일 기준 24시간 이내</p>
              </div>
              <p className="text-sm mt-4">
                환불 처리는 Paddle에서 직접 처리되므로, 환불 요청은 위의
                Paddle 링크를 통해 진행해주시기 바랍니다.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

