import { PrismaClient } from "@prisma/client";

// Prisma 싱글톤 — 개발 중 HMR로 인한 다중 인스턴스 방지.
// DATABASE_URL 미설정 시에는 lib/data가 mock을 쓰므로 이 클라이언트는 호출되지 않는다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
