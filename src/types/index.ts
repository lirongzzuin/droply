// DROPLY 공용 도메인 타입 — Prisma 모델과 1:1 정합, UI/데이터 레이어 공용.

export type SaleType = "FIXED" | "AUCTION" | "DROP";
export type ArtworkStatus = "DRAFT" | "LISTED" | "RESERVED" | "SOLD" | "ARCHIVED";
export type AuctionStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
export type PaymentMethod = "PG" | "DIRECT_TRANSFER";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

export interface Artist {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  statement?: string;
  isVerified: boolean;
  isTopArtist?: boolean;
  trustScore: number;
  socials?: { instagram?: string; tiktok?: string; website?: string };
  followerCount: number;
  followingCount: number;
  listedCount: number;
}

export interface Auction {
  startPrice: number;
  minIncrement: number;
  reservePrice?: number;
  startsAt: string;
  endsAt: string;
  status: AuctionStatus;
  bidCount: number;
  currentPrice: number;
  highBidderHandle?: string;
  antiSnipeSec: number;
  bids: BidView[];
}

export interface BidView {
  id: string;
  bidderHandle: string;
  bidderAvatar: string;
  amount: number;
  createdAt: string;
}

export interface Drop {
  dropAt: string;
  totalStock: number;
  soldStock: number;
  perUserLimit: number;
}

export interface PriceHistoryEntry {
  kind: "MINTED" | "LISTED" | "SOLD";
  label: string;
  date: string;
  amount?: number;
  counterpartyHandle?: string;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  medium: string;
  edition?: string;
  saleType: SaleType;
  status: ArtworkStatus;
  tags: string[];
  images: string[];
  fixedPrice?: number;
  allowPg: boolean;
  allowDirect: boolean;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  artist: Artist;
  auction?: Auction;
  drop?: Drop;
  priceHistory?: PriceHistoryEntry[];
  // 클라이언트 표시용 파생 가격(정가/현재가/드롭가)
  displayPrice?: number;
  liked?: boolean;
  wishlisted?: boolean;
  specs?: { format?: string; colorSpace?: string; resaleFee?: string; security?: string };
}

export type FeedFilter = "trending" | "new" | "ending" | "drops" | "following";
