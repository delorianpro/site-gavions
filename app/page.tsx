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

export default function Home() {
  return (
    <CtaVisibilityProvider>
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
