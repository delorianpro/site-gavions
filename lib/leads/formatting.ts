import type { Attribution, LeadFields, LeadPayload } from "./types";

export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  return digits.slice(0, 11);
}
export function formatPhone(value: string) {
  const d = phoneDigits(value);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  const split = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
}
export function collectLead(fields: LeadFields, origin: Attribution, page: string): LeadPayload {
  return {
    nome: fields.nome.trim(), whatsapp: "+55" + phoneDigits(fields.whatsapp), email: fields.email.trim(),
    empresa: fields.empresa.trim(), cidade: fields.cidade.trim(), tipo_local: fields.tipo,
    cameras: fields.cameras, internet: fields.internet, mensagem: fields.mensagem.trim(),
    consentimento: true, origem: origin, pagina: page.slice(0, 300), enviado_em: new Date().toISOString(),
  };
}
