import { NextResponse } from "next/server";
import { getDrop, toDropView } from "@/lib/services/drop";

export const dynamic = "force-dynamic";

/** 드롭 라이브 재고 폴링 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const d = getDrop(params.id);
  if (!d) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(toDropView(d), { headers: { "Cache-Control": "no-store" } });
}
