import "server-only";
import { cookies } from "next/headers";
import { findPersona, type SessionUser } from "./auth";

const COOKIE = "droply_uid";

/** 현재 로그인 사용자 (없으면 null) */
export function getCurrentUser(): SessionUser | null {
  const uid = cookies().get(COOKIE)?.value;
  if (!uid) return null;
  return findPersona(uid) ?? null;
}

export function setSession(userId: string) {
  cookies().set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}
