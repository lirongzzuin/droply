"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { markAllRead } from "@/lib/services/notifications";

export async function markAllReadAction() {
  const user = getCurrentUser();
  if (!user) return;
  markAllRead(user.id);
  revalidatePath("/notifications");
}
