"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { resolveReport } from "@/lib/services/moderation";

export async function resolveReportAction(id: string, status: "RESOLVED" | "DISMISSED"): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  // 운영: user.role === 'ADMIN' 검사. 데모에서는 로그인 사용자에게 허용.
  resolveReport(id, status);
  revalidatePath("/admin");
}
