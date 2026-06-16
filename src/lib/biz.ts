// 통신판매 사업자 정보 — 전자상거래법 표시 의무.
// 실제 값은 환경변수로 주입(코드 수정 불필요). 미설정 시 "(등록 예정)" 표기.

const v = (key: string, fallback = "(등록 예정)") => process.env[key]?.trim() || fallback;

export const BIZ = {
  name: v("NEXT_PUBLIC_BIZ_NAME", "DROPLY"),
  owner: v("NEXT_PUBLIC_BIZ_OWNER"),
  regNo: v("NEXT_PUBLIC_BIZ_REG_NO"), // 사업자등록번호
  mailOrderNo: v("NEXT_PUBLIC_BIZ_MAILORDER_NO"), // 통신판매업신고번호
  address: v("NEXT_PUBLIC_BIZ_ADDRESS"),
  tel: v("NEXT_PUBLIC_BIZ_TEL"),
  email: v("NEXT_PUBLIC_BIZ_EMAIL", "support@droply.app"),
  host: v("NEXT_PUBLIC_BIZ_HOST", "Vercel Inc."),
};

export const LAST_UPDATED = "2026-06-16";
