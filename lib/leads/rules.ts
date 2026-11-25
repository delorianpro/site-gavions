/** Shared, non-truncating validation. Never infer a valid phone by dropping digits. */
export function normalizeWhatsapp(value: string): string | null {
  if (!/^[+\d\s().-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) digits = digits.slice(2);
  const ddd = digits.slice(0, 2);
  const validDdds = "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" ");
  // Accept the form's existing 10/11-digit format, with a valid Brazilian DDD.
  if (!validDdds.includes(ddd) || !/^(?:[2-5]\d{7}|9\d{8})$/.test(digits.slice(2))) return null;
  if (/^(\d)\1+$/.test(digits.slice(2))) return null;
  return "+55" + digits;
}

export function validEmail(value: string): boolean {
  if (value.length > 120 || /[\s\u0000-\u001f\u007f]/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && local.length <= 64 && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    && domain.includes(".") && domain.split(".").every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
    && /^[A-Za-z]{2,63}$/.test(domain.split(".").at(-1) || "");
}
