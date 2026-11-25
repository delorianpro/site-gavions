import type { LeadConfig } from "./leads/types";

// Public destinations preserved from the original assets/config.js.
export const siteConfig = {
  leads: {
    leadEndpoint: "",
    leadEndpointFormat: "json",
    whatsappNumber: "",
    contactEmail: "delorianpro@gmail.com",
    requestTimeoutMs: 10000,
    responseContract: { kind: "http-status" },
  } satisfies LeadConfig,
};
