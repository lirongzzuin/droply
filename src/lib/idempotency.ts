import { kv } from "./redis";

/**
 * 멱등 처리 — 모든 쓰기 작업(구매·입찰·드롭구매·결제)의 기본.
 * 키 + 요청해시를 Redis(또는 in-memory)에 24h TTL로 저장.
 * 동일 키 재요청 시 최초 결과를 그대로 반환한다.
 */
const TTL_SEC = 24 * 60 * 60;
const prefix = (key: string) => `idem:${key}`;

export async function fnv1aHash(input: string): Promise<string> {
  // 의존성 없는 경량 해시 (요청 본문 동일성 비교용)
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

interface IdemRecord<T> {
  requestHash: string;
  result: T;
}

/**
 * 멱등 실행 래퍼.
 * @returns { result, replayed } — replayed=true면 이전 결과 반환(부수효과 미실행)
 */
export async function withIdempotency<T>(
  key: string,
  requestBody: unknown,
  run: () => Promise<T>,
): Promise<{ result: T; replayed: boolean }> {
  if (!key) {
    // 키가 없으면 멱등 보장 불가 — 그대로 실행 (호출부에서 헤더 강제 권장)
    return { result: await run(), replayed: false };
  }
  const requestHash = await fnv1aHash(JSON.stringify(requestBody ?? {}));
  const store = kv();
  const existing = await store.get(prefix(key));
  if (existing) {
    const rec = JSON.parse(existing) as IdemRecord<T>;
    if (rec.requestHash !== requestHash) {
      throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD");
    }
    return { result: rec.result, replayed: true };
  }
  const result = await run();
  await store.set(prefix(key), JSON.stringify({ requestHash, result } as IdemRecord<T>), TTL_SEC);
  return { result, replayed: false };
}
