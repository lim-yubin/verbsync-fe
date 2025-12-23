import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function PrivacyPage() {
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

        <h1 className="text-4xl font-bold tracking-tight mb-4">개인정보처리방침</h1>
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
              Verbsync(이하 "회사")는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령을 준수하며,
              이용자의 개인정보 보호를 매우 중요하게 생각합니다. 본 개인정보처리방침은 회사가 제공하는 Verbsync 서비스(이하
              "서비스")를 이용하는 과정에서 수집하는 개인정보의 항목, 처리 목적, 보유 및 이용 기간 등을 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보의 항목 및 수집 방법</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 수집 항목</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">필수 항목:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>이메일 주소 (계정 식별 및 로그인)</li>
                <li>비밀번호 (암호화하여 저장)</li>
                <li>이름 또는 닉네임</li>
              </ul>

              <p className="mt-4">
                <strong className="text-foreground">자동 수집 항목:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP 주소, 접속 로그, 쿠키, 서비스 이용 기록</li>
                <li>기기 정보 (브라우저 종류, OS 정보)</li>
              </ul>

              <p className="mt-4">
                <strong className="text-foreground">서비스 이용 시 생성되는 정보:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>프로젝트 정보 (프로젝트명, 설명 등)</li>
                <li>번역 키 및 번역 값 데이터</li>
                <li>API 키 (암호화하여 저장)</li>
                <li>도메인 허용 목록</li>
                <li>팀 멤버 정보 (팀 플랜 이용 시)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 수집 방법</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>회원가입 및 서비스 이용 과정에서 직접 입력</li>
              <li>서비스 이용 중 자동으로 생성 및 수집</li>
              <li>고객 지원 문의 시 제공되는 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 처리 목적</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">서비스 제공:</strong> 회원 관리, 프로젝트 및 번역 데이터 관리, API
                서비스 제공
              </li>
              <li>
                <strong className="text-foreground">서비스 개선:</strong> 이용 통계 분석, 서비스 품질 향상, 신규 기능
                개발
              </li>
              <li>
                <strong className="text-foreground">고객 지원:</strong> 문의 사항 응대, 기술 지원, 공지사항 전달
              </li>
              <li>
                <strong className="text-foreground">보안:</strong> 부정 이용 방지, 계정 보안 관리, 도메인 기반 접근 제어
              </li>
              <li>
                <strong className="text-foreground">요금 정산:</strong> 유료 플랜 이용 시 결제 처리 및 영수증 발급
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 보유 및 이용 기간</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
                보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">회원 정보:</strong> 회원 탈퇴 시까지 (단, 법령에 따라 보존이 필요한
                  경우 해당 기간 동안 보관)
                </li>
                <li>
                  <strong className="text-foreground">서비스 이용 기록:</strong> 3년 (통신비밀보호법)
                </li>
                <li>
                  <strong className="text-foreground">결제 정보:</strong> 5년 (전자상거래법)
                </li>
                <li>
                  <strong className="text-foreground">계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래법)
                </li>
              </ul>
              <p className="mt-4">
                회원 탈퇴 시 개인정보는 즉시 삭제되며, 위 보유기간에 해당하는 정보는 탈퇴 후에도 해당 기간 동안
                보관됩니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 제3자 제공</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
              </li>
              <li>
                서비스 제공에 필요한 최소한의 범위 내에서 외부 서비스 제공업체에 제공 (예: 결제 처리, 이메일 발송)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 개인정보의 처리 위탁</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              회사는 서비스 향상을 위해 다음과 같이 개인정보 처리 업무를 외부 전문업체에 위탁하여 운영할 수 있습니다:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">수탁업체</th>
                    <th className="border border-border p-3 text-left">위탁 업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">클라우드 인프라 제공업체</td>
                    <td className="border border-border p-3">서버 운영 및 데이터 저장</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">결제 대행 업체</td>
                    <td className="border border-border p-3">유료 플랜 결제 처리</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">이메일 발송 서비스</td>
                    <td className="border border-border p-3">이메일 인증 및 알림 발송</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              회사는 위탁 계약 시 개인정보 보호법에 따라 위탁 업무 수행 목적 외 개인정보 처리 금지,
              기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독 등을 계약서에 명시합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. 정보주체의 권리·의무 및 행사 방법</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
                <li>회원 탈퇴 (개인정보 삭제 요구 포함)</li>
              </ul>
              <p className="mt-4">
                위 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 회사는 이에 대해
                지체 없이 조치하겠습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 개인정보의 파기</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당
              개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에
                옮겨져 (종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시
                파기됩니다.
              </li>
              <li>
                <strong className="text-foreground">파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는
                기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. 개인정보 보호책임자</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
              피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-muted/50 p-6 rounded-lg space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">개인정보 보호책임자</strong>
              </p>
              <p>이메일: verbsync@gmail.com</p>
              <p className="mt-4">
                정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에
                관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. 개인정보의 안전성 확보 조치</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육 등
              </li>
              <li>
                <strong className="text-foreground">기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리,
                접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
              </li>
              <li>
                <strong className="text-foreground">물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제
              </li>
              <li>
                <strong className="text-foreground">암호화:</strong> 비밀번호는 암호화하여 저장하며, API 키는 암호화하여
                관리합니다.
              </li>
              <li>
                <strong className="text-foreground">도메인 제한:</strong> 허용된 도메인에서만 API 접근을 허용하여 무단
                접근을 방지합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. 쿠키의 운영 및 거부</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                회사는 이용자에게 개인화되고 맞춤화된 서비스를 제공하기 위해 쿠키를 사용합니다. 쿠키는 웹사이트를 방문할 때
                이용자의 브라우저에 저장되는 작은 텍스트 파일입니다.
              </p>
              <p>
                <strong className="text-foreground">쿠키 사용 목적:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>로그인 상태 유지</li>
                <li>서비스 이용 패턴 분석</li>
                <li>서비스 개선을 위한 통계 수집</li>
              </ul>
              <p className="mt-4">
                이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹브라우저 설정에서 쿠키 허용, 쿠키 차단 등의 설정을 할
                수 있습니다. 다만, 쿠키 설치를 거부할 경우 서비스 이용에 어려움이 있을 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. 개인정보처리방침의 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는
              변경사항의 시행 7일 전부터 서비스의 공지사항을 통하여 고지할 것입니다.
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

