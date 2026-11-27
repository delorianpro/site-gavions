import { siteUrl } from "./site-config";

type EntityReference = { "@id": string };
type Entity = EntityReference & { name: string; url: string };

type Organization = Entity & {
  "@type": "Organization";
  brand: EntityReference;
};

type Brand = Entity & {
  "@type": "Brand";
  description: string;
  logo: string;
};

type Service = Entity & {
  "@type": "Service";
  serviceType: string;
  description: string;
  provider: EntityReference;
  brand: EntityReference;
};

type WebSite = Entity & {
  "@type": "WebSite";
  inLanguage: string;
  publisher: EntityReference;
  about: EntityReference;
};

type StructuredDataGraph = {
  "@context": "https://schema.org";
  "@graph": (Organization | Brand | Service | WebSite)[];
};

const homeUrl = new URL("/", siteUrl).href;
const delorianUrl = "https://delorianpro.com.br";
// No verifiable institutional identifier was found on Delorian's public homepage.
const organizationId = `${delorianUrl}/#organization`;
const brandId = new URL("/#brand", siteUrl).href;

// Scoped to the homepage; future pages can compose their own graphs using these IDs.
export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "Delorian",
      url: delorianUrl,
      brand: { "@id": brandId },
    },
    {
      "@type": "Brand",
      "@id": brandId,
      name: "Gavions",
      url: homeUrl,
      description:
        "Gavions é a marca da Delorian para monitoramento inteligente de câmeras com inteligência artificial para empresas, galpões, lojas e obras.",
      logo: new URL("/assets/img/gavions-nome.png", siteUrl).href,
    },
    {
      "@type": "Service",
      "@id": new URL("/#service", siteUrl).href,
      name: "Monitoramento inteligente de câmeras com IA",
      serviceType: "Monitoramento de câmeras com inteligência artificial",
      url: homeUrl,
      description:
        "Monitoramento inteligente de câmeras com IA para empresas, galpões, lojas e obras, com detecção de invasões, reconhecimento de pessoas e veículos, alertas pelo WhatsApp e acionamento automático de sirenes e refletores no horário protegido.",
      provider: { "@id": organizationId },
      brand: { "@id": brandId },
      // Add areaServed only after the confirmed southern coverage is visible on the page.
    },
    {
      "@type": "WebSite",
      "@id": new URL("/#website", siteUrl).href,
      name: "Gavions",
      url: homeUrl,
      inLanguage: "pt-BR",
      publisher: { "@id": organizationId },
      about: { "@id": brandId },
    },
  ],
} satisfies StructuredDataGraph;

export function serializeStructuredData(data: StructuredDataGraph): string {
  // Escape '<' so even a literal closing script tag cannot leave the HTML script context.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
