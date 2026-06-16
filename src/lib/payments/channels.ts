// PortOne 결제 채널 설정 (클라이언트/서버 공용, NEXT_PUBLIC).
// 신청한 채널: 카드=KG이니시스 / 간편결제=카카오페이 / 가상계좌·계좌이체=한국결제네트웍스(KPN)
// 본인인증=다날. 채널키 미설정 시 해당 수단은 숨고, 전부 없으면 mock 결제로 폴백.

export const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? "";

export type PayMethodKey = "card" | "easypay" | "vbank";

export interface PayMethodConfig {
  key: PayMethodKey;
  label: string;
  icon: string;
  channelKey: string;
  payMethod: "CARD" | "EASY_PAY" | "VIRTUAL_ACCOUNT";
}

export const PAY_METHODS: PayMethodConfig[] = [
  {
    key: "card",
    label: "신용·체크카드",
    icon: "credit_card",
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD ?? "",
    payMethod: "CARD",
  },
  {
    key: "easypay",
    label: "카카오페이",
    icon: "account_balance_wallet",
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_EASYPAY ?? "",
    payMethod: "EASY_PAY",
  },
  {
    key: "vbank",
    label: "가상계좌·계좌이체",
    icon: "account_balance",
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_VBANK ?? "",
    payMethod: "VIRTUAL_ACCOUNT",
  },
];

export const IDENTITY_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_IDENTITY ?? "";

/** 결제 가능한 수단(채널키가 설정된 것만) */
export function availablePayMethods(): PayMethodConfig[] {
  return PAY_METHODS.filter((m) => m.channelKey);
}

/** PortOne 결제 활성화 여부 (storeId + 채널 1개 이상) */
export function isPortOneConfigured(): boolean {
  return Boolean(PORTONE_STORE_ID) && availablePayMethods().length > 0;
}

export function isIdentityConfigured(): boolean {
  return Boolean(PORTONE_STORE_ID && IDENTITY_CHANNEL_KEY);
}
