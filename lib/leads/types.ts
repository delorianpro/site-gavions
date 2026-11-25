export const leadErrorMessage = "Não foi possível enviar sua solicitação. Por favor, tente novamente.";
export const stepNames = ["contato", "local", "estrutura", "detalhes", "confirmacao"] as const;
export const locationTypes = ["Empresa ou escritório", "Galpão ou indústria", "Obra", "Comércio ou loja", "Várias unidades", "Outro"] as const;
export const cameraOptions = ["Ainda não tenho", "1 a 4", "5 a 8", "9 a 16", "Mais de 16"] as const;
export const internetOptions = ["Fixa (banda larga)", "Só 4G", "Não tem ainda", "Não sei"] as const;
export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "referrer", "landing"] as const;
export type StepName = typeof stepNames[number];
export type LocationType = typeof locationTypes[number];
export type Attribution = Partial<Record<typeof attributionKeys[number], string>>;
export type LeadFields = { nome: string; whatsapp: string; email: string; empresa: string; cidade: string; tipo: string; cameras: string; internet: string; mensagem: string; consentimento: boolean };
export type FieldName = keyof LeadFields;
export type TextFieldName = Exclude<FieldName, "consentimento">;
export type ChoiceFieldName = "tipo" | "cameras" | "internet";
export type LeadErrors = Partial<Record<FieldName, boolean>>;
export type LeadDraft = { fields: LeadFields; step: number };
export const emptyFields: LeadFields = { nome: "", whatsapp: "", email: "", empresa: "", cidade: "", tipo: "", cameras: "", internet: "", mensagem: "", consentimento: false };
export type LeadPayload = {
  nome: string; whatsapp: string; email: string; empresa: string; cidade: string;
  tipo_local: string; cameras: string; internet: string; mensagem: string;
  consentimento: true; origem: Attribution; pagina: string; enviado_em: string;
};
export type ResponseContract = { kind: "http-status" } | { kind: "json"; field: string; value: string | number | boolean };
export type LeadConfig = {
  leadEndpoint: string;
  leadEndpointFormat: "json" | "form";
  whatsappNumber: string;
  contactEmail: string;
  requestTimeoutMs: number;
  responseContract: ResponseContract;
};
export type FailureReason = "http" | "network" | "timeout" | "aborted" | "response";
export type TransportResult = { kind: "confirmed" } | { kind: "failed"; reason: FailureReason; status?: number };
export type SubmissionState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "confirmed" }
  | { kind: "failed"; reason: FailureReason }
  | { kind: "blocked" }
  | { kind: "invalid" };
