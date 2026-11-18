/**
 * US (NANP) phone helpers shared by the lead form (client) and the API route (server).
 * The forms show a fixed "+1" prefix, so only valid US numbers are accepted.
 */

export const US_PHONE_ERROR = "Please enter a valid 10-digit US phone number.";

/** All digits with a leading US country code (1) removed. Not truncated. */
export function usPhoneDigits(raw: string): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

/** Progressive mask as the user types or pastes: "(813) 555-0123". */
export function formatUsPhone(raw: string): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  // US area codes never start with 1, so a leading 1 is the country code (+1 autofill).
  if (d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Valid NANP number: exactly 10 digits, area code and exchange start with 2-9,
 * neither is an N11 service code (e.g. 911), and not one repeated digit.
 */
export function isValidUsPhone(raw: string): boolean {
  const d = usPhoneDigits(raw);
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(d)) return false;
  if (d.slice(1, 3) === "11" || d.slice(4, 6) === "11") return false;
  if (/^(\d)\1{9}$/.test(d)) return false;
  return true;
}

/** E.164 (+18135550123), or "" when the number isn't a valid US number. */
export function toUsE164(raw: string): string {
  return isValidUsPhone(raw) ? `+1${usPhoneDigits(raw)}` : "";
}
