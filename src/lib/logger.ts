import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type LogOptions = {
  action: string;
  businessId?: string | null;
  entityType?: string;
  entityId?: string;
  details?: any;
};

export async function logActivity(options: LogOptions) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const userName = session?.user?.name || "System/Unknown";

    await prisma.activityLog.create({
      data: {
        action: options.action,
        businessId: options.businessId || null,
        userId: userId,
        userName: userName,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details ? options.details : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
    // We intentionally don't throw to prevent breaking the main flow
  }
}
