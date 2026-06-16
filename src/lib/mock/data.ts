import type { Artist, Artwork } from "@/types";

// 결정적 이미지 (picsum seed) — R2 연동 전 mock 소스. next.config remotePatterns 허용됨.
const art = (seed: string, w = 1200, h = 1500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const ava = (seed: string) => `https://picsum.photos/seed/${seed}-ava/200/200`;

// 미래/과거 시각 헬퍼 (mock 타이머용) — 빌드 시점 고정이 아닌 런타임 상대값
const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const agoDays = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

export const ARTISTS: Artist[] = [
  {
    id: "u_void",
    handle: "v0id_walker",
    displayName: "V0ID_WALKER",
    avatarUrl: ava("void"),
    coverUrl: art("void-cover", 1600, 600),
    bio: "Neo-Tokyo 거리의 네온과 글리치를 수집하는 미디어 아티스트.",
    statement:
      "디지털 생태계 속 유기적 형태와 기하학적 구조의 충돌을 시각화합니다. 빛의 굴절과 액체 금속의 질감으로 미래적 미학을 탐구합니다.",
    isVerified: true,
    isTopArtist: true,
    trustScore: 920,
    socials: { instagram: "void_walker", tiktok: "void.walker" },
    followerCount: 12400,
    followingCount: 482,
    listedCount: 31,
  },
  {
    id: "u_kinetic",
    handle: "kinetic_lab",
    displayName: "KINETIC_LAB",
    avatarUrl: ava("kinetic"),
    coverUrl: art("kinetic-cover", 1600, 600),
    bio: "Morphogenesis — 형태 생성의 알고리즘.",
    statement: "세라믹과 글래스의 물성을 가상 공간에서 재해석하는 3D 스튜디오.",
    isVerified: true,
    trustScore: 740,
    socials: { website: "kineticlab.art" },
    followerCount: 8420,
    followingCount: 210,
    listedCount: 18,
  },
  {
    id: "u_starch",
    handle: "st_arch_01",
    displayName: "ST_ARCH_01",
    avatarUrl: ava("starch"),
    coverUrl: art("starch-cover", 1600, 600),
    bio: "Virtual Ruins — 가상 폐허의 건축가.",
    statement: "브루탈리즘 건축과 생성 메시 구조의 경계에서 작업합니다.",
    isVerified: false,
    trustScore: 410,
    socials: { instagram: "st.arch" },
    followerCount: 3120,
    followingCount: 88,
    listedCount: 9,
  },
  {
    id: "u_kaelo",
    handle: "kaelo_studio",
    displayName: "Kaelo Rivera",
    avatarUrl: ava("kaelo"),
    coverUrl: art("kaelo-cover", 1600, 600),
    bio: "Cyber-Organic 시리즈.",
    statement: "가상 공간에서의 '공명'을 테마로 빛과 액체 금속의 질감을 다룹니다.",
    isVerified: true,
    isTopArtist: true,
    trustScore: 880,
    socials: { instagram: "kaelo_studio", tiktok: "kaelo" },
    followerCount: 15800,
    followingCount: 320,
    listedCount: 24,
  },
];

const artistById = Object.fromEntries(ARTISTS.map((a) => [a.id, a]));

interface Raw extends Omit<Artwork, "artist"> {
  artistId: string;
}

const RAW: Raw[] = [
  {
    id: "a_neotokyo04",
    artistId: "u_void",
    title: "Neo-Tokyo Series #04",
    description:
      "비 내리는 네오도쿄의 거리, 네온 광고와 젖은 아스팔트의 반사를 고대비로 담은 사이버펑크 연작. 액체 금속 질감과 글리치가 충돌합니다.",
    medium: "디지털 3D",
    edition: "1/1",
    saleType: "AUCTION",
    status: "LISTED",
    tags: ["Cyberpunk", "Neon", "3D_Render", "AcidAesthetic"],
    images: [art("neotokyo04-a"), art("neotokyo04-b"), art("neotokyo04-c")],
    allowPg: true,
    allowDirect: false,
    likeCount: 1204,
    viewCount: 18400,
    createdAt: agoDays(2),
    auction: {
      startPrice: 1500000,
      minIncrement: 50000,
      reservePrice: 2000000,
      startsAt: agoDays(1),
      endsAt: inHours(0.7),
      status: "LIVE",
      bidCount: 12,
      currentPrice: 2450000,
      highBidderHandle: "vortex_art",
      antiSnipeSec: 180,
      bids: [
        { id: "b1", bidderHandle: "vortex_art", bidderAvatar: ava("vortex"), amount: 2450000, createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
        { id: "b2", bidderHandle: "k_collector", bidderAvatar: ava("kcol"), amount: 2420000, createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
        { id: "b3", bidderHandle: "neo_tokyo", bidderAvatar: ava("neot"), amount: 2380000, createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
      ],
    },
    priceHistory: [
      { kind: "MINTED", label: "에디션 발행 (Minted)", date: agoDays(40) },
      { kind: "LISTED", label: "경매 등록", date: agoDays(1), amount: 1500000, counterpartyHandle: "v0id_walker" },
    ],
  },
  {
    id: "a_morpho",
    artistId: "u_kinetic",
    title: "Morphogenesis Collection",
    description:
      "매트 블랙 세라믹과 라임 글래스 스피어가 상호작용하는 비대칭 구성. 브루탈리즘 건축의 물성을 가상으로 옮겼습니다.",
    medium: "디지털 3D",
    edition: "Open Edition",
    saleType: "DROP",
    status: "LISTED",
    tags: ["3D_Render", "Brutalism", "AcidAesthetic"],
    images: [art("morpho-a"), art("morpho-b")],
    allowPg: true,
    allowDirect: false,
    likeCount: 842,
    viewCount: 9200,
    createdAt: agoDays(1),
    drop: { dropAt: inHours(52), totalStock: 50, soldStock: 0, perUserLimit: 1 },
    priceHistory: [{ kind: "MINTED", label: "에디션 발행 (Minted)", date: agoDays(3) }],
  },
  {
    id: "a_ruins4",
    artistId: "u_starch",
    title: "Virtual Ruins IV",
    description:
      "하이퍼 디테일 생성 메시. 흑백 모노크롬 위로 코어에서 새어나오는 acid-lime 광원이 건축적이면서 유기적인 인상을 만듭니다.",
    medium: "디지털 / 프린트",
    edition: "12/50",
    saleType: "FIXED",
    status: "LISTED",
    tags: ["Generative", "Brutalism", "Print"],
    images: [art("ruins4-a"), art("ruins4-b")],
    fixedPrice: 550000,
    allowPg: true,
    allowDirect: true,
    likeCount: 2100,
    viewCount: 12200,
    createdAt: agoDays(5),
    priceHistory: [
      { kind: "MINTED", label: "에디션 발행 (Minted)", date: agoDays(60) },
      { kind: "LISTED", label: "리스트 등록", date: agoDays(5), amount: 550000, counterpartyHandle: "st_arch_01" },
    ],
  },
  {
    id: "a_resonance2",
    artistId: "u_kaelo",
    title: "Cyber-Organic Resonance v.2",
    description:
      "디지털 생태계 내에서 유기적 형태와 기하학적 구조가 충돌하며 발생하는 에너지를 시각화합니다. 가상 공간에서의 '공명'을 테마로 빛의 굴절과 액체 금속의 질감을 통해 정밀한 미래적 미학을 선사합니다. DROPLY 익스클루시브 에디션.",
    medium: "디지털 3D",
    edition: "12/50",
    saleType: "FIXED",
    status: "LISTED",
    tags: ["DigitalArt", "3D_Render", "AcidAesthetic", "Cyberpunk"],
    images: [art("resonance-a"), art("resonance-b"), art("resonance-c")],
    fixedPrice: 120000,
    allowPg: true,
    allowDirect: true,
    likeCount: 980,
    viewCount: 7400,
    createdAt: agoDays(7),
    specs: { format: "PNG / 4K", colorSpace: "P3 Wide", resaleFee: "7.5%", security: "Edition Cert" },
    priceHistory: [
      { kind: "MINTED", label: "에디션 발행 (Minted)", date: agoDays(61) },
      { kind: "LISTED", label: "리스트 등록", date: agoDays(46), amount: 120000, counterpartyHandle: "kaelo_studio" },
      { kind: "SOLD", label: "최종 거래 완료", date: agoDays(34), amount: 105000, counterpartyHandle: "art_collector_99" },
    ],
  },
  {
    id: "a_flux01",
    artistId: "u_kaelo",
    title: "VIRTUAL FLUX #01",
    description: "이리데센트 크롬과 반투명 글래스의 유동적 조각이 검은 공허에 멈춰 있습니다.",
    medium: "디지털 3D",
    edition: "1/1",
    saleType: "AUCTION",
    status: "LISTED",
    tags: ["3D_Render", "AcidAesthetic"],
    images: [art("flux01-a"), art("flux01-b")],
    allowPg: true,
    allowDirect: false,
    likeCount: 610,
    viewCount: 5400,
    createdAt: agoDays(3),
    auction: {
      startPrice: 800000,
      minIncrement: 50000,
      startsAt: agoDays(1),
      endsAt: inHours(30),
      status: "LIVE",
      bidCount: 5,
      currentPrice: 1200000,
      highBidderHandle: "k_collector",
      antiSnipeSec: 180,
      bids: [
        { id: "f1", bidderHandle: "k_collector", bidderAvatar: ava("kcol"), amount: 1200000, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
      ],
    },
  },
  {
    id: "a_neoncore",
    artistId: "u_kaelo",
    title: "NEON CORE",
    description: "razor-sharp acid-lime 광선이 모노크롬 지각판을 가르는 미니멀 구성.",
    medium: "디지털 3D",
    edition: "1/1",
    saleType: "FIXED",
    status: "LISTED",
    tags: ["AcidAesthetic", "Generative"],
    images: [art("neoncore-a")],
    fixedPrice: 2450000,
    allowPg: true,
    allowDirect: true,
    likeCount: 430,
    viewCount: 3100,
    createdAt: agoDays(10),
  },
  {
    id: "a_brutvoid",
    artistId: "u_kaelo",
    title: "BRUTALIST VOID",
    description: "raw 콘크리트 텍스처와 날카로운 기하 그림자, 미지의 광원에서 새어나오는 빛.",
    medium: "디지털",
    edition: "1/1",
    saleType: "FIXED",
    status: "LISTED",
    tags: ["Brutalism", "3D_Render"],
    images: [art("brutvoid-a")],
    fixedPrice: 890000,
    allowPg: true,
    allowDirect: false,
    likeCount: 270,
    viewCount: 2200,
    createdAt: agoDays(12),
  },
  {
    id: "a_cybersonic",
    artistId: "u_void",
    title: "CYBER SONIC",
    description:
      "기술과 예술의 경계를 허무는 '사이버 소닉' 시리즈의 첫 드롭. 금속의 차가운 물성과 디지털 광원의 유동을 극명한 대비로 표현. 전 세계 50점 한정.",
    medium: "디지털 3D",
    edition: "1~50/50",
    saleType: "DROP",
    status: "LISTED",
    tags: ["Cyberpunk", "AcidAesthetic", "3D_Render"],
    images: [art("cybersonic-a", 1600, 1600), art("cybersonic-b")],
    allowPg: true,
    allowDirect: false,
    likeCount: 1530,
    viewCount: 21000,
    createdAt: agoDays(1),
    drop: { dropAt: inHours(0.08), totalStock: 50, soldStock: 12, perUserLimit: 1 },
  },
];

export const ARTWORKS: Artwork[] = RAW.map((r) => {
  const { artistId, ...rest } = r;
  const displayPrice =
    rest.saleType === "AUCTION"
      ? rest.auction?.currentPrice
      : rest.saleType === "FIXED"
        ? rest.fixedPrice
        : rest.fixedPrice ?? 120000;
  return { ...rest, artist: artistById[artistId], displayPrice };
});
