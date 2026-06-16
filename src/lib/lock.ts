import { kv } from "./redis";

/**
 * 분산락 — Upstash SET NX EX (또는 in-memory 폴백).
 * 경매 입찰/드롭 재고 등 임계 구역 직렬화에 사용.
 */
export async function withLock<T>(
  resource: string,
  fn: () => Promise<T>,
  opts: { ttlSec?: number; retries?: number; retryDelayMs?: number } = {},
): Promise<T> {
  const { ttlSec = 5, retries = 25, retryDelayMs = 40 } = opts;
  const key = `lock:${resource}`;
  const token = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const store = kv();

  let acquired = false;
  for (let i = 0; i < retries; i++) {
    if (await store.setNX(key, token, ttlSec)) {
      acquired = true;
      break;
    }
    await new Promise((r) => setTimeout(r, retryDelayMs));
  }
  if (!acquired) throw new Error("LOCK_TIMEOUT");

  try {
    return await fn();
  } finally {
    // 토큰 확인 후 해제 (TTL 만료로 타인이 잡았으면 건드리지 않음)
    if ((await store.get(key)) === token) await store.del(key);
  }
}
