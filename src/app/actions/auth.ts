"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/session";
import { findPersona } from "@/lib/auth";
import { createNotification, listNotifications } from "@/lib/services/notifications";

function welcome(userId: string) {
  if (listNotifications(userId).length > 0) return;
  createNotification({ userId, type: "DROP_OPEN", title: "DROPLY에 오신 걸 환영해요 👋", body: "마음에 드는 작가를 팔로우하면 드롭 알림을 받을 수 있어요.", link: "/" });
}

/** 개발/데모 로그인 — 페르소나로 세션 설정 */
export async function devLogin(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!findPersona(userId)) throw new Error("unknown persona");
  setSession(userId);
  welcome(userId);
  redirect("/");
}

/** OAuth 시작 (provider 키 설정 시 실제 라우트로, mock 시 데모 로그인으로) */
export async function startOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  // 실제 구현에서는 /api/auth/[provider] 리디렉션. 데모에서는 컬렉터로 로그인.
  setSession("u_you");
  welcome("u_you");
  redirect(`/onboarding?via=${provider}`);
}

export async function logout() {
  clearSession();
  revalidatePath("/");
  redirect("/");
}
