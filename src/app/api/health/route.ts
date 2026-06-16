import { NextResponse } from "next/server";
import { isRedisConfigured } from "@/lib/redis";
import { isDbConfigured } from "@/lib/data";
import { isTossConfigured } from "@/lib/payments/toss";

export const dynamic = "force-dynamic";

/** 헬스체크 + 어댑터 구성 상태 (운영 가시성) */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    adapters: {
      db: isDbConfigured() ? "neon" : "mock",
      redis: isRedisConfigured() ? "upstash" : "memory",
      payments: isTossConfigured() ? "toss" : "mock",
      fraud: process.env.THECHEAT_API_KEY ? "thecheat" : "mock",
      email: process.env.RESEND_API_KEY ? "resend" : "mock",
    },
  });
}
