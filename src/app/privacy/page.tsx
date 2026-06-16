import { LegalShell, Article } from "@/components/LegalShell";
import { BIZ } from "@/lib/biz";

export const metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침">
      <Article no="1" title="수집하는 개인정보 항목">
        <p>회원가입·서비스 이용 과정에서 다음을 수집합니다. (1) 소셜 로그인 식별자, 이메일, 닉네임, 프로필 이미지 (2) 거래 시 주문·정산 정보 (3) 서비스 이용 기록, 기기/접속 정보. 직거래 사기조회 시 입력값(계좌·전화)은 <b>평문을 저장하지 않고 해시값만</b> 처리합니다.</p>
      </Article>
      <Article no="2" title="이용 목적">
        <p>회원 식별·인증, 작품 거래 중개, 결제·정산, 알림 발송, 고객 문의 대응, 사기·부정거래 방지, 서비스 개선 및 통계.</p>
      </Article>
      <Article no="3" title="보유 및 이용 기간">
        <p>회원 탈퇴 시 지체 없이 파기합니다. 다만 전자상거래법 등 관련 법령에 따라 계약·결제·소비자불만 기록 등은 법정 기간 동안 보관합니다(계약·청약철회 5년, 대금결제 5년, 소비자불만·분쟁 3년 등).</p>
      </Article>
      <Article no="4" title="제3자 제공 및 처리위탁">
        <p>법령에 근거하거나 이용자 동의가 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 결제(토스페이먼츠), 인프라(클라우드 호스팅), 알림 발송 등 서비스 운영에 필요한 범위에서 처리를 위탁할 수 있으며, 위탁 시 관련 사항을 고지합니다.</p>
      </Article>
      <Article no="5" title="이용자의 권리">
        <p>이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있으며, 회원 탈퇴를 통해 동의를 철회할 수 있습니다.</p>
      </Article>
      <Article no="6" title="개인정보 보호책임자">
        <p>개인정보 관련 문의: {BIZ.email} ({BIZ.tel}). 책임자: {BIZ.name} {BIZ.owner}.</p>
      </Article>
    </LegalShell>
  );
}
