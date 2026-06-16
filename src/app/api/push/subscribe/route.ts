import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Web Push 구독 저장 (mock). 운영 시 구독 객체를 DB에 저장하고
 * 알림 이벤트에서 web-push로 발송한다(VAPID 키 필요).
 */
export async function POST(req: Request) {
  try {
    const sub = await req.json();
    if (!sub?.endpoint) return NextResponse.json({ ok: false, error: "invalid_subscription" }, { status: 400 });
    // TODO(운영): PushSubscription DB 저장
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
