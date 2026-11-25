import { CopyrightYear } from "./CopyrightYear";
import { BrandImage } from "@/components/ui/BrandImage";
import { Icon } from "@/components/icons/Icon";
import { siteConfig } from "@/lib/site-config";
import { formatPhone } from "@/lib/leads/formatting";
import styles from "@/components/layout/SiteFooter.module.css";
import shared from "@/components/ui/Primitives.module.css";

export function SiteFooter() {
  const { contactEmail } = siteConfig.leads;
  const number = siteConfig.leads.whatsappNumber.replace(/\D/g, "");
  return (
    <footer className={styles.footer}>
      <div className={`${shared.wrap} ${styles.footerIn}`}>
        <div className={styles.fBrand}>
          <span className={styles.fLogo}><BrandImage variant="icon" className={styles.fLogoIcon} alt="" /><BrandImage variant="name" alt="Gavions" /></span>
          <p>Vigilância inteligente para empresas: câmeras com IA, sirene, refletores, alertas no celular e uma central acompanhando.</p>
        </div>
        <nav className={styles.fLinks} aria-label="Rodapé">
          <a href="#como-funciona">Como funciona</a>
          <a href="#app">O app</a>
          <a href="#recursos">Recursos</a>
          <a href="#seguranca">Privacidade</a>
          <a href="#perguntas">Dúvidas</a>
          <a href="#demonstracao">Agendar demonstração</a>
        </nav>
        <div className={styles.fContact} data-contact="">
          {number && <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer"><Icon name="wa" />WhatsApp {formatPhone(number)}</a>}
          {contactEmail && <a href={`mailto:${contactEmail}`}><Icon name="bell" />{contactEmail}</a>}
          <a href="#demonstracao"><Icon name="calendar" />Agendar demonstração</a>
        </div>
      </div>
      <p className={`${shared.wrap} ${styles.copy}`}>{"© "}<CopyrightYear />{" Gavions. Todos os direitos reservados."}</p>
    </footer>
  );
}
