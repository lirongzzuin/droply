"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 클라이언트 경량 상태 — 좋아요/위시리스트/팔로우 즉시 반응 + localStorage 영속.
 * (서버 영속은 Phase 2+에서 server action으로 승격)
 */
interface UIState {
  liked: Record<string, boolean>;
  wishlisted: Record<string, boolean>;
  following: Record<string, boolean>;
  notified: Record<string, boolean>; // 드롭 알림 신청
  toggleLike: (id: string) => void;
  toggleWishlist: (id: string) => void;
  toggleFollow: (handle: string) => void;
  setNotified: (id: string) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      liked: {},
      wishlisted: {},
      following: {},
      notified: {},
      toggleLike: (id) => set((s) => ({ liked: { ...s.liked, [id]: !s.liked[id] } })),
      toggleWishlist: (id) => set((s) => ({ wishlisted: { ...s.wishlisted, [id]: !s.wishlisted[id] } })),
      toggleFollow: (handle) => set((s) => ({ following: { ...s.following, [handle]: !s.following[handle] } })),
      setNotified: (id) => set((s) => ({ notified: { ...s.notified, [id]: true } })),
    }),
    { name: "droply-ui" },
  ),
);
