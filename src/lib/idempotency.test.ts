import { describe, it, expect, vi } from "vitest";
import { withIdempotency } from "./idempotency";

describe("withIdempotency (in-memory KV 폴백)", () => {
  it("최초 실행은 run을 호출하고 replayed=false", async () => {
    const run = vi.fn(async () => ({ orderId: "ord_1" }));
    const r = await withIdempotency("key-a", { x: 1 }, run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(r.replayed).toBe(false);
    expect(r.result.orderId).toBe("ord_1");
  });

  it("동일 키+동일 payload 재요청은 run을 다시 호출하지 않고 이전 결과 반환", async () => {
    const run = vi.fn(async () => ({ orderId: "ord_2_" + Math.random() }));
    const first = await withIdempotency("key-b", { x: 1 }, run);
    const second = await withIdempotency("key-b", { x: 1 }, run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(second.replayed).toBe(true);
    expect(second.result).toEqual(first.result);
  });

  it("동일 키 + 다른 payload 는 오류 (키 재사용 방지)", async () => {
    const run = vi.fn(async () => ({ ok: true }));
    await withIdempotency("key-c", { x: 1 }, run);
    await expect(withIdempotency("key-c", { x: 2 }, run)).rejects.toThrow(/REUSED/);
  });

  it("키가 없으면 멱등 보장 없이 그대로 실행", async () => {
    const run = vi.fn(async () => 42);
    const r = await withIdempotency("", {}, run);
    expect(r.result).toBe(42);
    expect(r.replayed).toBe(false);
  });
});
