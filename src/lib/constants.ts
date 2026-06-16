// 플랫폼 정책 상수 — 사업 모델 반영 (정가·경매 8%, 직거래 0%)

export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 8);

export const SALE_TYPE_LABEL: Record<string, string> = {
  FIXED: "정가 판매",
  AUCTION: "경매",
  DROP: "드롭",
};

export const FEED_FILTERS = [
  { key: "trending", label: "트렌딩" },
  { key: "new", label: "신규" },
  { key: "ending", label: "마감임박" },
  { key: "drops", label: "예정 드롭" },
  { key: "following", label: "팔로잉" },
] as const;

// 작품 등록 시 추천 태그/무드
export const SUGGESTED_TAGS = [
  "DigitalArt",
  "3D_Render",
  "AcidAesthetic",
  "Cyberpunk",
  "Brutalism",
  "Generative",
  "Print",
  "Neon",
];

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  accent?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: "explore", label: "둘러보기" },
  { href: "/search", icon: "search", label: "검색" },
  { href: "/new", icon: "add_circle", label: "드롭", accent: true },
  { href: "/notifications", icon: "notifications", label: "알림" },
  { href: "/me", icon: "person", label: "프로필" },
];
