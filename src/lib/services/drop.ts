import "server-only";
import { state, type DropState } from "../server-state";
import { withLock } from "../lock";
import { withIdempotency } from "../idempotency";
import { createNotification } from "./notifications";

export interface DropView {
  artworkId: string;
  dropAt: string;
  totalStock: number;
  soldStock: number;
  remaining: number;
  perUserLimit: number;
  live: boolean;
  soldOut: boolean;
}

export function getDrop(artworkId: string): DropState | undefined {
  return state().drops.get(artworkId);
}

export function toDropView(d: DropState): DropView {
  const remaining = Math.max(0, d.totalStock - d.soldStock);
  return {
    artworkId: d.artworkId,
    dropAt: d.dropAt,
    totalStock: d.totalStock,
    soldStock: d.soldStock,
    remaining,
    perUserLimit: d.perUserLimit,
    live: new Date(d.dropAt).getTime() <= Date.now(),
    soldOut: remaining <= 0,
  };
}

export interface BuyDropResult {
  ok: boolean;
  code?: "NOT_LIVE" | "SOLD_OUT" | "LIMIT" | "NOT_FOUND";
  message?: string;
  view?: DropView;
  myCount?: number;
  replayed?: boolean;
}

/**
 * 드롭 구매 — 원자 재고 차감(오버셀 0) + 1인 구매 제한 + 멱등.
 * 락 안에서 검사-차감을 원자적으로 수행한다.
 * (운영 시 Upstash Lua DECR로 락 없이 원자화 가능 — 시그니처 유지)
 */
export async function buyDrop(input: { artworkId: string; userId: string; idempotencyKey: string }): Promise<BuyDropResult> {
  const { artworkId, userId, idempotencyKey } = input;

  const run = async (): Promise<BuyDropResult> =>
    withLock(`drop:${artworkId}`, async () => {
      const d = getDrop(artworkId);
      if (!d) return { ok: false, code: "NOT_FOUND", message: "드롭을 찾을 수 없습니다." };
      if (new Date(d.dropAt).getTime() > Date.now())
        return { ok: false, code: "NOT_LIVE", message: "아직 드롭이 시작되지 않았습니다.", view: toDropView(d) };

      const mine = d.buyers[userId] ?? 0;
      if (mine >= d.perUserLimit)
        return { ok: false, code: "LIMIT", message: `1인 ${d.perUserLimit}점 한정입니다.`, view: toDropView(d), myCount: mine };
      if (d.totalStock - d.soldStock <= 0)
        return { ok: false, code: "SOLD_OUT", message: "품절됐습니다.", view: toDropView(d) };

      d.soldStock += 1;
      d.buyers[userId] = mine + 1;

      createNotification({
        userId,
        type: "PAID",
        title: "드롭 구매 성공! 🎉",
        body: "한정 드롭을 손에 넣었어요. 결제를 마무리해 주세요.",
        link: `/art/${artworkId}`,
      });

      return { ok: true, view: toDropView(d), myCount: d.buyers[userId] };
    });

  const { result, replayed } = await withIdempotency(idempotencyKey, input, run);
  return { ...result, replayed };
}
