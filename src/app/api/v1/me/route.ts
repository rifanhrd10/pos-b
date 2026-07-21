import type { NextRequest } from "next/server";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    return noStoreJson({
      id: context.user.id,
      businessId: context.businessId,
      employeeId: context.employeeId,
      name: context.employee.name || context.user.name,
      email: context.user.email,
      role: context.employee.role.name,
      permissions: context.permissions,
      outlets: context.employee.outlets
        .filter((row) => row.outlet.isActive)
        .map((row) => row.outlet),
    });
  } catch (error) {
    return apiError(error);
  }
}
