import type { LeadConfig } from "./leads/types";

export const siteUrl = "https://www.gavions.com";

// Public contact details and the same-origin form endpoint; never put secrets here.
export const siteConfig = {
  leads: {
    leadEndpoint: "/api/leads",
    leadEndpointFormat: "json",
    whatsappNumber: "",
    contactEmail: "delorianpro@gmail.com",
    requestTimeoutMs: 15000,
    responseContract: { kind: "json", field: "ok", value: true },
  } satisfies LeadConfig,
};
