import "server-only";

/**
 * 이메일 발송 — Resend 어댑터. RESEND_API_KEY 미설정 시 콘솔 로깅 폴백.
 * (결제완료/낙찰/드롭오픈 등 사이드채널 알림에 사용)
 */
export async function sendEmail(args: { to: string; subject: string; html: string }): Promise<{ ok: boolean }> {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") console.log(`[email:mock] → ${args.to} · ${args.subject}`);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "DROPLY <noreply@droply.app>", ...args }),
  });
  return { ok: res.ok };
}
