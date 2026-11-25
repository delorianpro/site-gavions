"use client";

import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { TrackedAnchor } from "@/components/ui/TrackedAnchor";
import { Icon } from "@/components/icons/Icon";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCtaVisibility } from "./CtaVisibilityProvider";
import styles from "./FloatingActions.module.css";

export function FloatingActions() {
  const { hero, demo } = useCtaVisibility();
  const mobile = useMediaQuery("(max-width: 767px)");
  const number = siteConfig.leads.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = number ? `https://wa.me/${number}?${new URLSearchParams({ text: "Olá! Vi o site da Gavions e quero saber mais sobre a vigilância inteligente para a minha empresa." }).toString()}` : "#";
  const visible = mobile && !hero && !demo;

  return (
    <aside aria-label="Contato rápido" aria-hidden={!visible && !number}>
      <div className={[styles.mobileCta, visible && styles.show].filter(Boolean).join(" ")}
        data-mobile-cta="" aria-hidden={!visible} inert={!visible}>
        <Button as="a" variant="primary" fullWidth href="#demonstracao" data-track="cta_sticky" tabIndex={visible ? undefined : -1}>Agendar demonstração</Button>
      </div>
      <TrackedAnchor className={styles.waFloat} href={whatsappUrl} target="_blank" rel="noopener" aria-label="Conversar no WhatsApp"
        data-wa-float="" hidden={!number} data-track="whatsapp_float" data-cta-visible={visible ? "" : undefined}><Icon name="wa" /></TrackedAnchor>
    </aside>
  );
}
