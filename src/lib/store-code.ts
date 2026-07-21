import { prisma } from "@/lib/prisma"

const GENERIC_BUSINESS_WORDS = new Set([
  "PT",
  "CV",
  "UD",
  "RM",
  "TOKO",
  "WARUNG",
  "KEDAI",
  "KOPI",
  "CAFE",
  "COFFEE",
  "RESTO",
  "RESTAURANT",
  "SHOP",
  "STORE",
  "OUTLET",
  "GROUP",
  "NUSANTARA",
  "INDONESIA",
  "OFFICIAL",
])

export function storeCodeBase(businessName: string) {
  const tokens = businessName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const meaningfulTokens = tokens.filter((token) => !GENERIC_BUSINESS_WORDS.has(token))
  const candidates = meaningfulTokens.length > 0 ? meaningfulTokens : tokens
  if (candidates.length === 0) return "TOKO"

  let code = candidates[0]
  for (let index = 1; code.length < 5 && index < candidates.length; index += 1) {
    code += candidates[index]
  }
  return code.slice(0, 10) || "TOKO"
}

export async function generateUniqueStoreCode(businessName: string, excludeBusinessId?: string) {
  const base = storeCodeBase(businessName)
  const existing = await prisma.business.findMany({
    where: {
      storeCode: { startsWith: base, mode: "insensitive" },
      ...(excludeBusinessId ? { id: { not: excludeBusinessId } } : {}),
    },
    select: { storeCode: true },
  })
  const used = new Set(existing.map((business) => business.storeCode?.toUpperCase()).filter(Boolean))

  if (!used.has(base)) return base
  for (let suffix = 2; suffix <= 999; suffix += 1) {
    const candidate = `${base}${suffix}`
    if (!used.has(candidate)) return candidate
  }

  throw new Error("Tidak dapat membuat kode toko unik dari nama bisnis")
}
