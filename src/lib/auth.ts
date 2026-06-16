// 인증 — OAuth 어댑터 추상화 + 개발용 로그인 폴백.
// 원칙(스펙 8.5): 외부 provider 키 미설정 시 해당 버튼은 숨고, 개발 로그인만 노출.
// 운영 전환 시 이 모듈 위에 NextAuth(Kakao/Google/Apple)를 얹으면 된다.

export interface OAuthProviderInfo {
  id: "kakao" | "google" | "apple";
  label: string;
  brandClass: string; // 버튼 배경 톤
  configured: boolean;
}

export interface SessionUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  isArtist: boolean;
  isVerified: boolean;
  trustScore: number;
}

const PROVIDERS: Omit<OAuthProviderInfo, "configured">[] = [
  { id: "kakao", label: "카카오로 시작하기", brandClass: "bg-[#FEE500] text-black" },
  { id: "google", label: "Google로 시작하기", brandClass: "bg-white text-black" },
  { id: "apple", label: "Apple로 시작하기", brandClass: "bg-black text-white border border-outline-variant" },
];

export function getAvailableProviders(): OAuthProviderInfo[] {
  const env = process.env;
  const configured: Record<string, boolean> = {
    kakao: Boolean(env.KAKAO_CLIENT_ID && env.KAKAO_CLIENT_SECRET),
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET),
  };
  return PROVIDERS.map((p) => ({ ...p, configured: configured[p.id] }));
}

export function isAnyOAuthConfigured(): boolean {
  return getAvailableProviders().some((p) => p.configured);
}

// 개발/데모용 로그인 가능한 페르소나 (실제로는 OAuth 가입자)
export const DEV_PERSONAS: SessionUser[] = [
  { id: "u_you", handle: "you", displayName: "당신 (컬렉터)", avatarUrl: "https://picsum.photos/seed/you-ava/200/200", isArtist: false, isVerified: false, trustScore: 120 },
  { id: "u_kaelo", handle: "kaelo_studio", displayName: "Kaelo Rivera", avatarUrl: "https://picsum.photos/seed/kaelo-ava/200/200", isArtist: true, isVerified: true, trustScore: 880 },
  { id: "u_void", handle: "v0id_walker", displayName: "V0ID_WALKER", avatarUrl: "https://picsum.photos/seed/void-ava/200/200", isArtist: true, isVerified: true, trustScore: 920 },
];

export function findPersona(id: string): SessionUser | undefined {
  return DEV_PERSONAS.find((p) => p.id === id);
}
