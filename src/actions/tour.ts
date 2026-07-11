"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markTourComplete() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hasCompletedTour: true },
  });
  return { success: true };
}
