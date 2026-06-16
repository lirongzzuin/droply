import { kv } from "./redis";

/**
 * 고정 윈도우 레이트리밋 — Upstash INCR + EXPIRE (in-memory 폴백).
 * 입찰/구매 등 남용 가능한 쓰기 작업 보호.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number }> {
  const bucket = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
  const count = await kv().incr(bucket, windowSec);
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}
