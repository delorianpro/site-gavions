import type { Attribution, Handoff, LeadConfig, LeadFields, LeadPayload } from "./types";

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
export function leadText(lead: LeadPayload) {
  const lines = ["Olá! Quero agendar uma demonstração da Gavions."];
  const values = [["Nome", lead.nome], ["Empresa", lead.empresa], ["Cidade", lead.cidade], ["Tipo de local", lead.tipo_local], ["Câmeras", lead.cameras], ["Internet", lead.internet], ["WhatsApp", formatPhone(lead.whatsapp)], ["E-mail", lead.email], ["Mensagem", lead.mensagem]];
  values.forEach(([label, value]) => { if (value) lines.push(`${label}: ${value}`); });
  return lines.join("\n");
}
export function createHandoff(lead: LeadPayload, config: LeadConfig): Handoff | null {
  const number = config.whatsappNumber.replace(/\D/g, "");
  // URLSearchParams also safely normalizes incomplete Unicode input.
  if (number) return { method: "whatsapp", url: `https://wa.me/${number}?${new URLSearchParams({ text: leadText(lead) }).toString().replace(/\+/g, "%20")}` };
  if (config.contactEmail.trim()) {
    const params = new URLSearchParams({ subject: "Demonstração Gavions: " + (lead.empresa || lead.nome), body: leadText(lead) });
    return { method: "email", url: `mailto:${config.contactEmail.trim()}?${params.toString().replace(/\+/g, "%20")}` };
  }
  return null;
}
export function hasDestination(config: LeadConfig) {
  return Boolean(config.leadEndpoint.trim() || config.whatsappNumber.replace(/\D/g, "") || config.contactEmail.trim());
}
export function encodeForm(lead: LeadPayload) {
  const body = new URLSearchParams();
  Object.entries(lead).forEach(([key, value]) => {
    if (key === "origem") Object.entries(lead.origem).forEach(([name, entry]) => body.append("origem_" + name, entry));
    else body.append(key, String(value));
  });
  return body;
}
