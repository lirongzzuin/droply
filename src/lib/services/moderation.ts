import "server-only";
import { state, nextId, type ReportRecord, type ReviewRecord } from "../server-state";
import { bumpTrust, getOrder } from "./order";
import { createNotification } from "./notifications";

// ── 신고 / 모더레이션 ──
export function createReport(args: { targetType: ReportRecord["targetType"]; targetId: string; reporterId: string; reason: string }): ReportRecord {
  const r: ReportRecord = { ...args, id: nextId("rpt"), status: "OPEN", createdAt: new Date().toISOString() };
  state().reports.unshift(r);
  return r;
}

export function listReports(): ReportRecord[] {
  return state().reports;
}

export function resolveReport(id: string, status: "RESOLVED" | "DISMISSED"): boolean {
  const r = state().reports.find((x) => x.id === id);
  if (!r) return false;
  r.status = status;
  return true;
}

// ── 리뷰 (거래 후 상호 평가 → trustScore 연동) ──
export function addReview(args: { orderId: string; reviewerId: string; rating: number; comment?: string }): { ok: boolean; message: string; review?: ReviewRecord } {
  const order = getOrder(args.orderId);
  if (!order || order.buyerId !== args.reviewerId) return { ok: false, message: "주문을 찾을 수 없습니다." };
  if (order.reviewed) return { ok: false, message: "이미 리뷰를 남겼습니다." };
  if (order.status !== "COMPLETED") return { ok: false, message: "거래 완료 후 리뷰할 수 있습니다." };
  const rating = Math.max(1, Math.min(5, Math.round(args.rating)));
  const review: ReviewRecord = {
    id: nextId("rvw"),
    orderId: args.orderId,
    reviewerId: args.reviewerId,
    revieweeHandle: order.sellerHandle,
    rating,
    comment: args.comment,
    createdAt: new Date().toISOString(),
  };
  state().reviews.unshift(review);
  order.reviewed = true;
  bumpTrust(order.sellerHandle, (rating - 3) * 5); // 4~5점 가산, 1~2점 감점
  createNotification({ userId: `u_${order.sellerHandle}`, type: "REVIEW", title: "새 리뷰가 등록됐어요", body: `${rating}점 평가를 받았습니다.`, link: `/@${order.sellerHandle}` });
  return { ok: true, message: "리뷰가 등록되었습니다.", review };
}

export function reviewsForHandle(handle: string): ReviewRecord[] {
  return state().reviews.filter((r) => r.revieweeHandle === handle);
}
