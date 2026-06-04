/** Strip em/en dashes from customer-facing copy. */
export function withoutEmDash(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ". ")
    .replace(/\.\s*\./g, ".")
    .replace(/\s+\./g, ".")
    .trim();
}
