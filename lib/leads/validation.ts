import { normalizeWhatsapp, validEmail } from "./rules";
import { formatPhone } from "./formatting";
import { cameraOptions, emptyFields, internetOptions, locationTypes, stepNames, type FieldName, type LeadDraft, type LeadErrors, type LeadFields, type TextFieldName } from "./types";

export const maxLengths: Record<TextFieldName, number> = { nome: 80, whatsapp: 16, email: 120, empresa: 80, cidade: 60, tipo: 80, cameras: 40, internet: 40, mensagem: 600 };
export const stepFields: FieldName[][] = [["nome", "whatsapp"], ["empresa", "cidade", "tipo"], ["cameras", "internet"], ["email", "mensagem"], ["consentimento"]];
export function invalidField(fields: LeadFields, name: FieldName): boolean {
  switch (name) {
    case "nome": case "cidade": return fields[name].trim().length < 2;
    case "whatsapp": return normalizeWhatsapp(fields.whatsapp) === null;
    case "email": return fields.email.trim() !== "" && !validEmail(fields.email.trim());
    case "tipo": return !locationTypes.some(value => value === fields.tipo);
    case "cameras": return !cameraOptions.some(value => value === fields.cameras);
    case "internet": return !internetOptions.some(value => value === fields.internet);
    case "consentimento": return !fields.consentimento;
    default: return false;
  }
}
export function validate(fields: LeadFields, step?: number): LeadErrors {
  const names: FieldName[] = step === undefined ? ["nome", "whatsapp", "email", "cidade", "tipo", "cameras", "internet", "consentimento"] : stepFields[step];
  return Object.fromEntries(names.filter(name => invalidField(fields, name)).map(name => [name, true]));
}
export function stepComplete(fields: LeadFields, step: number) {
  if (step >= 4) return false;
  return stepFields[step].every(name => !invalidField(fields, name) && (name === "empresa" || String(fields[name]).trim() !== ""));
}
function object(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
export function restoreDraft(value: unknown): LeadDraft {
  const fields = { ...emptyFields };
  if (!object(value) || !object(value.fields)) return { fields, step: 0 };
  for (const name of Object.keys(maxLengths) as TextFieldName[]) {
    const entry = value.fields[name];
    if (typeof entry === "string") fields[name] = name === "whatsapp" ? formatPhone(entry) : entry.slice(0, maxLengths[name]);
  }
  fields.consentimento = value.fields.consentimento === true;
  if (!locationTypes.some(v => v === fields.tipo)) fields.tipo = "";
  if (!cameraOptions.some(v => v === fields.cameras)) fields.cameras = "";
  if (!internetOptions.some(v => v === fields.internet)) fields.internet = "";
  let step = Math.max(0, stepNames.findIndex(name => name === value.step));
  for (const previous of [0, 1, 2, 3]) {
    if (previous < step && Object.keys(validate(fields, previous)).length) { step = previous; break; }
  }
  return { fields, step };
}
