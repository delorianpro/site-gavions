import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";
import { homeStructuredData, serializeStructuredData } from "@/lib/structured-data";
import { CtaVisibilityProvider } from "@/components/layout/CtaVisibilityProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { FactsSection } from "@/components/sections/FactsSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DetectionSimulation } from "@/components/sections/DetectionSimulation";
import { AppTourSection } from "@/components/sections/AppTourSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { MonitoringSection } from "@/components/sections/MonitoringSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { ConnectivitySection } from "@/components/sections/ConnectivitySection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { HiringSection } from "@/components/sections/HiringSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { LeadSection } from "@/components/sections/LeadSection";
import { SvgDefinitions } from "@/components/icons/SvgDefinitions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";

const title = "Gavions | Monitoramento inteligente de câmeras com IA";
const description =
  "Proteja empresas, galpões, lojas ou obras com monitoramento de câmeras por IA, detecção de invasões, alertas pelo WhatsApp e acionamento automático de sirenes e refletores.";
const socialImage = {
  url: "/assets/img/og-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Gavions: ilustração de uma pessoa detectada no portão, sirene acionada e notificação de alerta no celular.",
};

// Keep home metadata here so future pages can define their own search and sharing information.
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: new URL("/", siteUrl).href,
  },
  openGraph: {
    title,
    description,
    url: new URL("/", siteUrl).href,
    siteName: "Gavions",
    type: "website",
    locale: "pt_BR",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: socialImage.url, alt: socialImage.alt }],
  },
};

export default function Home() {
  return (
    <CtaVisibilityProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData(homeStructuredData),
        }}
      />
      <SvgDefinitions />
      <SiteHeader />
      <main id="conteudo">
        <HeroSection />
        <FactsSection />
        <ProblemSection />
        <HowItWorksSection />
        <DetectionSimulation />
        <AppTourSection />
        <FeaturesSection />
        <MonitoringSection />
        <SecuritySection />
        <AudienceSection />
        <ConnectivitySection />
        <ComparisonSection />
        <HiringSection />
        <FaqSection />
        <LeadSection />
      </main>
      <SiteFooter />
      <FloatingActions />
    </CtaVisibilityProvider>
  );
}
