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
              본 환불 정책은 Verbsync(이하 "회사")가 제공하는 유료 서비스 플랜(Starter, Pro, Enterprise)의 환불 및 취소에
              관한 사항을 규정합니다. 본 정책은 전자상거래법 및 소비자기본법 등 관련 법령을 준수합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 환불 정책</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                <p className="text-lg font-semibold text-foreground mb-2">14일 이내 전액 환불 보장</p>
                <p className="leading-relaxed">
                  구독 시작일로부터 14일 이내에 취소를 요청하시면, 결제하신 전액을 환불해드립니다. 별도의 조건이나 예외 없이
                  전액 환불이 보장됩니다.
                </p>
              </div>
              <p className="leading-relaxed">
                회원은 유료 플랜 구독 후 14일 이내에 언제든지 환불을 요청할 수 있으며, 회사는 해당 요청에 대해 즉시 전액
                환불을 처리합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 환불 절차</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 환불 신청</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    환불을 원하시는 경우 고객 지원 이메일(
                    <strong className="text-foreground">verbsync@gmail.com</strong>)로 환불 요청을 보내주시거나, 대시보드
                    내 설정 메뉴에서 구독 취소를 진행하실 수 있습니다.
                  </li>
                  <li>
                    환불 신청 시 다음 정보를 포함해주세요:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>계정 이메일 주소</li>
                      <li>구독 중인 플랜명</li>
                      <li>구독 시작일</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 환불 처리</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>환불 신청 접수 후 영업일 기준 3일 이내에 환불 처리를 완료합니다.</li>
                  <li>
                    환불이 승인된 경우, 결제 수단에 따라 다음 기간 내에 환불이 완료됩니다:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>신용카드: 승인 취소 후 영업일 기준 3~5일</li>
                      <li>계좌이체: 영업일 기준 1~3일</li>
                      <li>기타 결제 수단: 해당 결제 대행사의 정책에 따름</li>
                    </ul>
                  </li>
                  <li>
                    환불 금액은 원 결제 수단으로 환불되며, 원 결제 수단이 불가능한 경우 회원이 지정한 계좌로 환불할 수 있습니다.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 구독 취소 및 자동 갱신</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 유료 플랜은 자동 갱신되며, 다음 결제일 전까지 취소하지 않으면 자동으로 결제됩니다.</p>
              <p>
                ② 구독 취소를 원하시는 경우 다음 결제일 전까지 취소하시면 됩니다. 취소 후에도 현재 결제 기간이 종료될 때까지
                서비스를 이용하실 수 있습니다.
              </p>
              <p>
                ③ 구독 취소 시 다음 결제일부터 무료 플랜으로 자동 전환되며, 무료 플랜의 제한을 초과하는 데이터는 보관되지 않을
                수 있습니다.
              </p>
              <p>
                ④ 구독 취소 후 재가입 시, 이전 데이터는 복구되지 않을 수 있으니 필요한 데이터는 미리 백업하시기 바랍니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. 환불 관련 문의</h2>
            <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-muted-foreground">
              <p>환불 관련 문의사항이 있으시면 아래로 연락해주세요:</p>
              <div>
                <p className="font-semibold text-foreground mb-2">고객 지원</p>
                <p>이메일: verbsync@gmail.com</p>
                <p className="mt-2">응답 시간: 영업일 기준 24시간 이내</p>
              </div>
              <p className="text-sm mt-4">
                환불 처리 과정에서 추가 정보가 필요한 경우, 회원에게 개별적으로 연락을 드립니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 정책 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 환불 정책은 법령의 변경, 서비스 정책의 변경 등에 따라 변경될 수 있으며, 변경 시 서비스 내 공지사항을 통해
              사전에 안내해드립니다. 변경된 정책은 공지한 시점부터 적용되며, 변경 전에 체결된 계약에 대해서는 기존 정책이
              적용됩니다.
            </p>
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

