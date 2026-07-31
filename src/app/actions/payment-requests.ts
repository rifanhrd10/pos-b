"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function getPaymentRequests() {
  const requests = await prisma.paymentRequest.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      business: {
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return requests;
}

export async function approvePaymentRequest(
  requestId: string,
  newPlanName: string, // "starter" | "pro" | "enterprise"
  newStatus: string, // "active" | "trial" | "expired"
  durationMonths: number
) {
  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { business: { include: { subscription: true } } }
  });

  if (!request) throw new Error("Payment request not found");

  const plan = await prisma.plan.findUnique({
    where: { name: newPlanName }
  });

  if (!plan) throw new Error("Plan not found");

  // Calculate new expiry date
  let newExpiry = new Date();
  if (request.business.subscription?.currentPeriodEnd) {
     const currentExpiry = new Date(request.business.subscription.currentPeriodEnd);
     if (currentExpiry > new Date()) {
       newExpiry = currentExpiry;
     }
  }
  newExpiry.setMonth(newExpiry.getMonth() + durationMonths);

  await prisma.$transaction([
    prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    }),
    prisma.subscription.upsert({
      where: { businessId: request.businessId },
      create: {
        businessId: request.businessId,
        planId: plan.id,
        status: newStatus,
        currentPeriodEnd: newExpiry
      },
      update: {
        planId: plan.id,
        status: newStatus,
        currentPeriodEnd: newExpiry
      }
    })
  ]);

  await logActivity({
    action: "APPROVE_PAYMENT",
    businessId: request.businessId, // For IT Admin, we tag the business affected
    entityType: "SUBSCRIPTION",
    entityId: request.businessId,
    details: { plan: newPlanName, status: newStatus, duration: durationMonths }
  });

  revalidatePath("/itadmin/payments");
  return { success: true };
}

export async function rejectPaymentRequest(requestId: string) {
  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" }
  });

  const request = await prisma.paymentRequest.findUnique({ where: { id: requestId } });
  
  await logActivity({
    action: "REJECT_PAYMENT",
    businessId: request?.businessId || null,
    entityType: "PAYMENT_REQUEST",
    entityId: requestId,
  });

  revalidatePath("/itadmin/payments");
  return { success: true };
}

export async function createDummyPaymentRequest(businessId: string) {
  const existing = await prisma.paymentRequest.findFirst({
    where: { businessId, status: "PENDING" }
  });
  if (existing) return { success: true }; // already has one

  const newRequest = await prisma.paymentRequest.create({
    data: {
      businessId,
      status: "PENDING"
    }
  });

  await logActivity({
    action: "REQUEST_RENEWAL",
    businessId: businessId,
    entityType: "PAYMENT_REQUEST",
    entityId: newRequest.id,
  });

  return { success: true };
}
