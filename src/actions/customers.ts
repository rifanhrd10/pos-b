"use server"
export async function getCustomers(businessId: string, options?: Record<string, unknown>) { return { customers: [], total: 0, page: 1, pageSize: 20 } }
export async function getCustomer(id: string) { return null }
export async function createCustomer(businessId: string, data: Record<string, unknown>) { return { error: "Not implemented" as string | undefined, customer: undefined as unknown } }
export async function updateCustomer(id: string, data: Record<string, unknown>) { return { ok: false, error: undefined as string | undefined } }
export async function deleteCustomer(id: string) { return { ok: false, error: undefined as string | undefined } }
export async function searchCustomers(businessId: string, query: string) { return [] as Array<{ id: string; name: string; phone: string | null; email: string | null; totalVisits: number; totalSpent: number }> }
export async function getTopCustomers(businessId: string, limit?: number) { return [] }
