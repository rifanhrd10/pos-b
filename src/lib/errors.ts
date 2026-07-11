export function getErrorMessage(value: unknown, fallback = "Terjadi kesalahan. Coba lagi.") {
  if (typeof value === "string" && value.trim()) return value;
  if (value instanceof Error && value.message) return value.message;
  if (value && typeof value === "object") {
    const message = Reflect.get(value, "message");
    if (typeof message === "string" && message.trim()) return message;
    const error = Reflect.get(value, "error");
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallback;
}
