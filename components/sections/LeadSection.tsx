import { Reveal } from "@/components/ui/Reveal";
import { CtaTarget } from "@/components/layout/CtaTarget";
import { Icon } from "@/components/icons/Icon";
import { LeadFormCard } from "@/components/lead-form/LeadFormCard";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/LeadSection.module.css";

export function LeadSection() {
  return (
    <CtaTarget as="section" target="demo" className={`${shared.section} ${styles.ctaSec}`} id="demonstracao">
      <div className={styles.ctaBg} aria-hidden="true"></div>
      <div className={`${shared.wrap} ${shared.split} ${styles.ctaIn}`}>
        <Reveal>
          <p className={shared.eyebrow}>Demonstração</p>
          <h2>Veja a Gavions funcionando antes de decidir</h2>
          <p className={shared.sub} data-description="">Conte um pouco sobre o seu local. A gente retorna para entender suas câmeras, mostrar o app em ação e montar a proposta.</p>
          <ol className={styles.next}>
            <li><span>1</span><div>
                <b>Retornamos pelo WhatsApp</b>
                <small>Com as perguntas certas sobre o seu local.</small>
              </div></li>
            <li><span>2</span><div>
                <b>Avaliamos o que você já tem</b>
                <small>Câmeras, rede, internet e pontos que precisam de proteção.</small>
              </div></li>
            <li><span>3</span><div>
                <b>Mostramos o app e enviamos a proposta</b>
                <small>Sem compromisso.</small>
              </div></li>
          </ol>
          <p className={styles.heritage}><Icon name="zap" />Desenvolvida pela Delorian, empresa especializada em automação, segurança eletrônica e tecnologias inteligentes de proteção patrimonial.</p>
        </Reveal>
        <LeadFormCard />
      </div>
    </CtaTarget>
  );
}
