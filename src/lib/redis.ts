/**
 * Upstash Redis 어댑터 — 캐시/분산락/레이트리밋/멱등 저장.
 * UPSTASH_REDIS_REST_URL 미설정 시 in-memory Map으로 폴백한다.
 * (단일 인스턴스 개발/소규모 운영용. 다중 인스턴스 시 Upstash 필수.)
 */

interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec?: number): Promise<void>;
  setNX(key: string, value: string, ttlSec: number): Promise<boolean>;
  incr(key: string, ttlSec?: number): Promise<number>;
  del(key: string): Promise<void>;
}

class MemoryKV implements KVStore {
  private store = new Map<string, { v: string; exp: number | null }>();

  private alive(k: string) {
    const e = this.store.get(k);
    if (!e) return null;
    if (e.exp != null && e.exp < Date.now()) {
      this.store.delete(k);
      return null;
    }
    return e;
  }

  async get(key: string) {
    return this.alive(key)?.v ?? null;
  }
  async set(key: string, value: string, ttlSec?: number) {
    this.store.set(key, { v: value, exp: ttlSec ? Date.now() + ttlSec * 1000 : null });
  }
  async setNX(key: string, value: string, ttlSec: number) {
    if (this.alive(key)) return false;
    await this.set(key, value, ttlSec);
    return true;
  }
  async incr(key: string, ttlSec?: number) {
    const cur = Number(this.alive(key)?.v ?? 0) + 1;
    await this.set(key, String(cur), ttlSec);
    return cur;
  }
  async del(key: string) {
    this.store.delete(key);
  }
}

class UpstashKV implements KVStore {
  constructor(private url: string, private token: string) {}

  private async cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(`${this.url}/${args.map((a) => encodeURIComponent(String(a))).join("/")}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      cache: "no-store",
    });
    const json = (await res.json()) as { result: T };
    return json.result;
  }

  async get(key: string) {
    return (await this.cmd<string | null>("GET", key)) ?? null;
  }
  async set(key: string, value: string, ttlSec?: number) {
    if (ttlSec) await this.cmd("SET", key, value, "EX", ttlSec);
    else await this.cmd("SET", key, value);
  }
  async setNX(key: string, value: string, ttlSec: number) {
    const r = await this.cmd<string | number | null>("SET", key, value, "NX", "EX", ttlSec);
    return r === "OK" || r === 1;
  }
  async incr(key: string, ttlSec?: number) {
    const n = await this.cmd<number>("INCR", key);
    if (ttlSec && n === 1) await this.cmd("EXPIRE", key, ttlSec);
    return n;
  }
  async del(key: string) {
    await this.cmd("DEL", key);
  }
}

let _kv: KVStore | null = null;
export function kv(): KVStore {
  if (_kv) return _kv;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  _kv = url && token ? new UpstashKV(url, token) : new MemoryKV();
  return _kv;
}

export const isRedisConfigured = () =>
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
