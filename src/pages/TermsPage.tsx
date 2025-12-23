import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function TermsPage() {
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

        <h1 className="text-4xl font-bold tracking-tight mb-4">이용약관</h1>
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
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 Verbsync(이하 "회사")가 제공하는 다국어(i18n) 관리 플랫폼 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">"서비스"</strong>란 회사가 제공하는 다국어 관리 플랫폼으로, 번역 키 및
                번역 값의 관리, API를 통한 실시간 번역 데이터 제공 등의 기능을 포함합니다.
              </li>
              <li>
                <strong className="text-foreground">"이용자"</strong>란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는
                회원 및 비회원을 말합니다.
              </li>
              <li>
                <strong className="text-foreground">"회원"</strong>이란 서비스에 회원등록을 하고 서비스를 이용하는 자를 말합니다.
              </li>
              <li>
                <strong className="text-foreground">"계정"</strong>이란 회원의 식별과 서비스 이용을 위하여 회원이 선정하고
                회사가 승인하는 이메일 주소를 말합니다.
              </li>
              <li>
                <strong className="text-foreground">"API 키"</strong>란 서비스의 API를 이용하기 위해 발급받는 인증 키를
                말합니다.
              </li>
              <li>
                <strong className="text-foreground">"프로젝트"</strong>란 회원이 서비스 내에서 생성하고 관리하는 번역 데이터의
                집합을 말합니다.
              </li>
              <li>
                <strong className="text-foreground">"콘텐츠"</strong>란 회원이 서비스에 업로드하거나 입력한 모든 데이터(번역
                키, 번역 값, 프로젝트 정보 등)를 말합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
              <p>② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
              <p>
                ③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스의 초기화면에 그
                적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리한 약관의 개정의 경우에는 공지 외에
                이메일 등으로 별도로 통지합니다.
              </p>
              <p>
                ④ 이용자는 개정된 약관에 대해 동의하지 않을 권리가 있으며, 개정된 약관에 동의하지 않을 경우 이용계약을 해지할
                수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서
                회원가입을 신청합니다.
              </p>
              <p>② 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
              <p>③ 회원가입의 성립 시기는 회사의 승낙이 회원에게 도달한 시점으로 합니다.</p>
              <p>④ 회원은 회원가입 시 등록한 사항에 변경이 있는 경우, 즉시 회사에 해당 변경사항을 알려야 합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>번역 키 및 번역 값 관리 서비스</li>
                <li>API를 통한 실시간 번역 데이터 제공 (Over-the-Air 업데이트)</li>
                <li>다국어 프로젝트 관리 도구</li>
                <li>Excel/CSV 등 파일 형식의 Import/Export 기능 (유료 플랜)</li>
                <li>팀 협업 기능 (유료 플랜)</li>
                <li>AI 자동 번역 기능 (Pro 플랜)</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
              </ul>
              <p>② 회사는 서비스의 내용을 변경할 수 있으며, 변경 시에는 사전에 공지합니다.</p>
              <p>③ 회사는 운영상, 기술상의 필요에 따라 제공하는 전부 또는 일부 서비스를 변경할 수 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의
                제공을 일시적으로 중단할 수 있습니다.
              </p>
              <p>
                ② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여
                배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
              </p>
              <p>
                ③ 사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제8조에
                정한 방법으로 이용자에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제7조 (회원의 의무)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 회원은 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc pl-6 space-y-2 ml-4">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>API 키를 제3자에게 무단으로 제공하거나 공유하는 행위</li>
                <li>허용된 도메인 외의 도메인에서 API를 호출하는 행위</li>
                <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 조회, 제공하거나 상업적으로 이용하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ul>
              <p>
                ② 회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을
                준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.
              </p>
              <p>③ 회원은 자신의 계정과 API 키의 관리 책임을 지며, 제3자에게 노출되지 않도록 주의해야 합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제8조 (회원의 게시물 및 콘텐츠)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회원이 서비스 내에 게시하거나 업로드한 모든 콘텐츠(번역 키, 번역 값, 프로젝트 정보 등)의 지적재산권은 회원에게
                있습니다. 다만, 회사는 서비스의 운영, 홍보, 개선 등을 위하여 필요한 범위 내에서 회원의 콘텐츠를 사용할 수
                있습니다.
              </p>
              <p>
                ② 회원은 자신이 게시한 콘텐츠에 대해 책임을 지며, 회사는 회원이 게시한 콘텐츠로 인해 발생하는 법적 분쟁에 대해
                책임을 지지 않습니다.
              </p>
              <p>
                ③ 회사는 회원이 게시한 콘텐츠가 본 약관 또는 관련 법령에 위반된다고 판단되는 경우, 사전 통지 없이 해당 콘텐츠를
                삭제하거나 게시를 거부할 수 있습니다.
              </p>
              <p>
                ④ 회원은 서비스 이용 중 생성된 데이터를 백업할 책임이 있으며, 회사는 데이터 손실에 대해 책임을 지지 않습니다.
                다만, 회사의 귀책사유로 인한 데이터 손실의 경우에는 예외로 합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제9조 (요금 및 결제)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 서비스는 기본적으로 무료로 제공되며, 추가 기능을 이용하기 위해서는 유료 플랜에 가입해야 합니다.</p>
              <p>② 유료 플랜의 요금, 결제 방법, 결제 시기 등은 서비스 내 요금제 페이지에 명시된 내용에 따릅니다.</p>
              <p>③ 회원이 유료 플랜을 이용하는 경우, 회사는 회원이 선택한 결제 수단을 통해 요금을 청구합니다.</p>
              <p>④ 요금은 선불로 지급하며, 회원이 요금을 지급하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
              <p>⑤ 환불 정책은 각 플랜의 특성에 따라 다를 수 있으며, 구체적인 내용은 서비스 내에 별도로 안내됩니다.</p>
              <p>⑥ 회사는 요금제를 변경할 수 있으며, 변경 시 사전에 공지합니다. 변경된 요금제는 다음 결제 주기부터 적용됩니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제10조 (API 이용)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 회원은 회사가 제공하는 API를 이용하여 자신의 애플리케이션에서 번역 데이터를 가져올 수 있습니다.</p>
              <p>② API 이용 시 회원은 발급받은 API 키를 사용해야 하며, API 키는 회원 본인만 사용해야 합니다.</p>
              <p>③ 회원은 도메인 제한 기능을 통해 허용된 도메인에서만 API를 호출할 수 있도록 설정할 수 있습니다.</p>
              <p>
                ④ 회사는 API의 안정성과 보안을 위해 Rate Limiting 등 제한을 둘 수 있으며, 과도한 API 호출 시 일시적으로
                서비스 이용을 제한할 수 있습니다.
              </p>
              <p>⑤ 회사는 API의 변경, 중단, 종료 시 사전에 공지하며, 이로 인한 손해에 대해서는 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제11조 (개인정보보호)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 이용자의 개인정보 보호를 위하여 노력합니다. 이용자의 개인정보 보호에 관해서는 관련법령 및 회사가 정하는
              "개인정보처리방침"에 정한 바에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제12조 (회사의 의무)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를
                제공하기 위하여 노력합니다.
              </p>
              <p>② 회사는 이용자의 개인정보 보호를 위해 보안시스템을 구축하며 개인정보처리방침을 공시하고 준수합니다.</p>
              <p>③ 회사는 서비스와 관련하여 이용자로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</p>
              <p>④ 회사는 이용자가 안전하게 서비스를 이용할 수 있도록 보안 시스템을 구축하고 운영합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제13조 (손해배상)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 중대한 과실에
                의한 경우를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
              </p>
              <p>
                ② 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여
                얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </p>
              <p>③ 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제14조 (면책조항)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한
                책임이 면제됩니다.
              </p>
              <p>② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
              <p>
                ③ 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여
                얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </p>
              <p>④ 회사는 회원이 게시한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제15조 (분쟁의 해결)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                ① 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는
                거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 명확하지 아니한 경우에는
                민사소송법에 따라 관할법원을 정합니다.
              </p>
              <p>② 회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제16조 (기타)</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>① 본 약관에서 정하지 아니한 사항에 대해서는 관련법령 또는 상관례에 따릅니다.</p>
              <p>② 회사는 필요한 경우 특정 서비스에 관하여 적용될 사항(이하 "개별약관")을 정하여 이를 서비스 내에 게시할 수 있습니다.</p>
              <p>③ 본 약관과 개별약관의 내용이 상충하는 경우에는 개별약관의 내용이 우선 적용됩니다.</p>
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

