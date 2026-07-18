import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { asInputJson, createOfflineCashOrder, offlineOrderPayloadSchema } from "@/lib/mobile-order-sync";
import { getEntitlement, verifyOfflineLicense } from "@/lib/mobile-subscription";
import { prisma } from "@/lib/prisma";

const mutationSchema = z.object({
  mutationId: z.string().min(1).max(200),
  entityType: z.string().min(1).max(100),
  entityId: z.string().min(1).max(200),
  operation: z.string().min(1).max(50),
  payload: z.unknown(),
  deviceId: z.string().min(8).max(200),
  clientCreatedAt: z.number().int().positive(),
});
const pushSchema = z.object({
  mutations: z.array(mutationSchema).max(100),
  licenseToken: z.string().min(1).max(10_000),
});

export async function POST(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const parsed = pushSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Batch sinkronisasi tidak valid", parsed.error.flatten());
    }

    const acceptedMutationIds: string[] = [];
    const rejected: { mutationId: string; code: string; message: string }[] = [];
    for (const mutation of parsed.data.mutations) {
      const previous = await prisma.syncMutation.findUnique({ where: { mutationId: mutation.mutationId } });
      if (previous) {
        if (previous.businessId !== context.businessId || previous.deviceId !== context.deviceId) {
          rejected.push({ mutationId: mutation.mutationId, code: "MUTATION_ID_CONFLICT", message: "Mutation ID telah digunakan" });
        } else if (previous.status === "accepted") {
          acceptedMutationIds.push(mutation.mutationId);
        } else if (previous.status === "rejected") {
          rejected.push({
            mutationId: mutation.mutationId,
            code: previous.errorCode ?? "MUTATION_REJECTED",
            message: previous.errorMessage ?? "Mutasi sebelumnya ditolak",
          });
        } else {
          await processMutation(context, parsed.data.licenseToken, mutation, acceptedMutationIds, rejected, false);
        }
        continue;
      }

      let created = false;
      try {
        await prisma.syncMutation.create({
          data: {
            mutationId: mutation.mutationId,
            businessId: context.businessId,
            sessionId: context.sessionId,
            deviceId: context.deviceId,
            entityType: mutation.entityType,
            entityId: mutation.entityId,
            operation: mutation.operation,
            payload: asInputJson(mutation.payload),
          },
        });
        created = true;
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
      }
      if (!created) {
        const raced = await prisma.syncMutation.findUnique({ where: { mutationId: mutation.mutationId } });
        if (raced?.businessId === context.businessId && raced.status === "accepted") {
          acceptedMutationIds.push(mutation.mutationId);
          continue;
        }
      }
      await processMutation(context, parsed.data.licenseToken, mutation, acceptedMutationIds, rejected, true);
    }

    const entitlement = await getEntitlement({
      businessId: context.businessId,
      sessionId: context.sessionId,
      deviceId: context.deviceId,
    });
    return noStoreJson({ acceptedMutationIds, rejected, entitlement });
  } catch (error) {
    return apiError(error);
  }
}

async function processMutation(
  context: Awaited<ReturnType<typeof authenticateMobile>>,
  licenseToken: string,
  mutation: z.infer<typeof mutationSchema>,
  accepted: string[],
  rejected: { mutationId: string; code: string; message: string }[],
  persistFailure: boolean
) {
  try {
    if (mutation.deviceId !== context.deviceId) {
      throw new MobileApiError(403, "DEVICE_MISMATCH", "Mutasi berasal dari perangkat lain");
    }
    await verifyOfflineLicense({
      token: licenseToken,
      businessId: context.businessId,
      sessionId: context.sessionId,
      deviceId: context.deviceId,
      clientCreatedAt: mutation.clientCreatedAt,
    });
    if (mutation.entityType !== "order" || mutation.operation !== "CREATE") {
      throw new MobileApiError(422, "UNSUPPORTED_MUTATION", "Versi API ini hanya menerima CREATE order offline");
    }
    const payload = offlineOrderPayloadSchema.parse(mutation.payload);
    if (payload.order.id !== mutation.entityId) {
      throw new MobileApiError(422, "ENTITY_ID_MISMATCH", "Entity ID tidak cocok dengan order");
    }
    const result = await createOfflineCashOrder(context, payload);
    await prisma.syncMutation.update({
      where: { mutationId: mutation.mutationId },
      data: { status: "accepted", result, processedAt: new Date(), errorCode: null, errorMessage: null },
    });
    accepted.push(mutation.mutationId);
  } catch (error) {
    const apiFailure = error instanceof MobileApiError
      ? error
      : error instanceof z.ZodError
        ? new MobileApiError(422, "INVALID_ORDER_PAYLOAD", "Payload order tidak valid", error.flatten())
        : new MobileApiError(409, "ORDER_SYNC_FAILED", "Order tidak dapat disinkronkan");
    if (persistFailure) {
      await prisma.syncMutation.update({
        where: { mutationId: mutation.mutationId },
        data: {
          status: "rejected",
          errorCode: apiFailure.code,
          errorMessage: apiFailure.message,
          processedAt: new Date(),
        },
      });
    }
    rejected.push({ mutationId: mutation.mutationId, code: apiFailure.code, message: apiFailure.message });
  }
}
