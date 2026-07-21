export function parseCurrencyValue(value: FormDataEntryValue | string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;

  const cleaned = String(value).replace(/[^\d,-]/g, "").replace(",", ".");
  if (!cleaned) return undefined;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatCurrencyInput(value: string | number | null | undefined): string {
  const parsed = parseCurrencyValue(value);
  if (parsed === undefined) return "";
  return `Rp${Math.round(parsed).toLocaleString("id-ID")}`;
}
