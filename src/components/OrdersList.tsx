"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { formatKRW, cn } from "@/lib/utils";
import { completeOrderAction, reviewOrderAction } from "@/app/actions/orders";

interface OrderVM {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  sellerHandle: string;
  amount: number;
  feeAmount: number;
  method: "PG" | "DIRECT_TRANSFER";
  status: string;
  reviewed: boolean;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  SHIPPED: "배송 중",
  COMPLETED: "거래 완료",
  CANCELLED: "취소",
  REFUNDED: "환불",
  DISPUTED: "분쟁",
};

export function OrdersList({ orders }: { orders: OrderVM[] }) {
  const [items, setItems] = useState(orders);
  const [msg, setMsg] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);

  async function complete(id: string) {
    const r = await completeOrderAction(id);
    setMsg(r.message);
    if (r.ok) setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status: "COMPLETED" } : o)));
    setTimeout(() => setMsg(null), 2600);
  }

  async function submitReview(id: string, rating: number, comment: string) {
    const r = await reviewOrderAction(id, rating, comment);
    setMsg(r.message);
    if (r.ok) setItems((prev) => prev.map((o) => (o.id === id ? { ...o, reviewed: true } : o)));
    setReviewing(null);
    setTimeout(() => setMsg(null), 2600);
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-secondary flex flex-col items-center gap-3">
        <Icon name="receipt_long" className="text-5xl" />
        아직 주문 내역이 없어요.
        <Link href="/" className="mt-2 bg-acid-lime text-black font-bold px-6 py-3 rounded-lg shadow-acid">작품 둘러보기</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((o) => (
        <div key={o.id} className="p-4 bg-surface-container border border-outline-variant rounded-xl">
          <div className="flex gap-4">
            <Link href={`/art/${o.artworkId}`} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-outline-variant">
              <Image src={o.artworkImage} alt={o.artworkTitle} fill sizes="80px" className="object-cover" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <p className="font-bold truncate">{o.artworkTitle}</p>
                <span className={cn("shrink-0 text-[10px] font-mono px-2 py-0.5 rounded uppercase", o.status === "COMPLETED" ? "bg-acid-lime/10 text-acid-on" : o.status === "PAID" ? "bg-primary-fixed/10 text-primary-fixed-dim" : "bg-surface-container-high text-secondary")}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <p className="text-secondary text-sm">@{o.sellerHandle} · {o.method === "PG" ? "온라인 결제" : "직거래"}</p>
              <p className="font-mono text-primary mt-1">{formatKRW(o.amount)}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-outline-variant flex gap-2 justify-end">
            {o.status === "PAID" && (
              <button onClick={() => complete(o.id)} className="px-4 py-2 rounded-lg bg-acid-lime text-black font-bold text-sm active:scale-95 transition-all">수령 확정</button>
            )}
            {o.status === "COMPLETED" && !o.reviewed && (
              <button onClick={() => setReviewing(o.id)} className="px-4 py-2 rounded-lg border border-outline-variant text-primary text-sm active:scale-95 transition-all">리뷰 작성</button>
            )}
            {o.reviewed && <span className="text-secondary text-xs font-mono self-center">리뷰 완료 ✓</span>}
          </div>

          {reviewing === o.id && <ReviewForm onSubmit={(r, c) => submitReview(o.id, r, c)} onCancel={() => setReviewing(null)} />}
        </div>
      ))}

      {msg && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-surface-container-high border border-acid-lime/40 text-primary px-5 py-3 rounded-full text-sm shadow-acid animate-slide-up">
          {msg}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ onSubmit, onCancel }: { onSubmit: (rating: number, comment: string) => void; onCancel: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <div className="mt-3 pt-3 border-t border-outline-variant">
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n}점`}>
            <span className={cn("material-symbols-outlined", n <= rating ? "fill text-acid-on" : "text-secondary")} aria-hidden>star</span>
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="거래 경험을 남겨주세요 (선택)" className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-acid-lime resize-none" />
      <div className="flex gap-2 justify-end mt-2">
        <button onClick={onCancel} className="px-4 py-2 text-secondary text-sm">취소</button>
        <button onClick={() => onSubmit(rating, comment)} className="px-4 py-2 rounded-lg bg-acid-lime text-black font-bold text-sm active:scale-95 transition-all">등록</button>
      </div>
    </div>
  );
}
