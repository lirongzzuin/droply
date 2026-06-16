import "server-only";
import { ARTWORKS } from "./mock/data";

/**
 * 런타임 가변 도메인 상태 — 경매/드롭/주문/채팅/알림/리뷰/신고.
 * mock에서 lazy 시드. globalThis 싱글톤으로 HMR/요청 간 유지.
 *
 * ⚠️ 단일 인스턴스(개발/소규모) 기준. 다중 인스턴스 운영 시 이 상태는
 * Postgres(영속) + Upstash(원자연산/락)로 승격한다 — 서비스 함수 시그니처는 유지.
 */

export interface BidRecord {
  id: string;
  bidderId?: string;
  bidderHandle: string;
  bidderAvatar: string;
  amount: number;
  createdAt: string;
}

export interface AuctionState {
  artworkId: string;
  startPrice: number;
  minIncrement: number;
  reservePrice?: number;
  startsAt: string;
  endsAt: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  antiSnipeSec: number;
  version: number;
  currentPrice: number;
  highBidderHandle?: string;
  highBidderId?: string;
  bids: BidRecord[];
}

export interface DropState {
  artworkId: string;
  dropAt: string;
  totalStock: number;
  soldStock: number;
  perUserLimit: number;
  buyers: Record<string, number>; // userId -> 구매 수량
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "DISPUTED";

export interface OrderRecord {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  buyerId: string;
  sellerHandle: string;
  amount: number;
  feeAmount: number;
  payoutAmount: number;
  method: "PG" | "DIRECT_TRANSFER";
  status: OrderStatus;
  idempotencyKey: string;
  pgTxnId?: string;
  createdAt: string;
  reviewed: boolean;
}

export interface ChatMessageRecord {
  id: string;
  roomKey: string;
  senderId: string;
  body?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: "OUTBID" | "WON" | "ENDING_SOON" | "DROP_OPEN" | "NEW_MESSAGE" | "PAID" | "REVIEW" | "SOLD";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeHandle: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  targetType: "ARTWORK" | "USER" | "CHAT";
  targetId: string;
  reporterId: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

interface State {
  auctions: Map<string, AuctionState>;
  drops: Map<string, DropState>;
  orders: OrderRecord[];
  chats: Map<string, ChatMessageRecord[]>;
  notifications: NotificationRecord[];
  reviews: ReviewRecord[];
  reports: ReportRecord[];
  trustDelta: Map<string, number>;
  seq: number;
}

function seed(): State {
  const auctions = new Map<string, AuctionState>();
  const drops = new Map<string, DropState>();
  for (const a of ARTWORKS) {
    if (a.auction) {
      auctions.set(a.id, {
        artworkId: a.id,
        startPrice: a.auction.startPrice,
        minIncrement: a.auction.minIncrement,
        reservePrice: a.auction.reservePrice,
        startsAt: a.auction.startsAt,
        endsAt: a.auction.endsAt,
        status: a.auction.status,
        antiSnipeSec: a.auction.antiSnipeSec,
        version: 0,
        currentPrice: a.auction.currentPrice,
        highBidderHandle: a.auction.highBidderHandle,
        bids: a.auction.bids.map((b) => ({ ...b })),
      });
    }
    if (a.drop) {
      drops.set(a.id, {
        artworkId: a.id,
        dropAt: a.drop.dropAt,
        totalStock: a.drop.totalStock,
        soldStock: a.drop.soldStock,
        perUserLimit: a.drop.perUserLimit,
        buyers: {},
      });
    }
  }
  return {
    auctions,
    drops,
    orders: [],
    chats: new Map(),
    notifications: [],
    reviews: [],
    reports: [],
    trustDelta: new Map(),
    seq: 1,
  };
}

const g = globalThis as unknown as { __droplyState?: State };
export function state(): State {
  if (!g.__droplyState) g.__droplyState = seed();
  return g.__droplyState;
}

export function nextId(prefix: string): string {
  const s = state();
  s.seq += 1;
  return `${prefix}_${s.seq.toString(36)}${Date.now().toString(36)}`;
}

/** 테스트용 상태 초기화 */
export function __resetState() {
  g.__droplyState = seed();
}
