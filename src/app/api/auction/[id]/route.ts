import { NextResponse } from "next/server";
import { getAuction, closeIfDue, toView } from "@/lib/services/auction";

export const dynamic = "force-dynamic";

/** 경매 라이브 상태 폴링 (경량 — 상시 WS 대비 운영비 0) */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const a = closeIfDue(getAuction(params.id));
  if (!a) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(toView(a), { headers: { "Cache-Control": "no-store" } });
}
