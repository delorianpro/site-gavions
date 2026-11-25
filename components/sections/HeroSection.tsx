import { CtaTarget } from "@/components/layout/CtaTarget";
import { Button } from "@/components/ui/Button";
import { HeroScreen } from "@/components/app-preview/screens/HeroScreen";
import { Icon } from "@/components/icons/Icon";
import { PhoneFrame } from "@/components/app-preview/PhoneFrame";
import styles from "@/components/sections/HeroSection.module.css";
import shared from "@/components/ui/Primitives.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} id="topo">
      <div className={styles.heroBg} aria-hidden="true"></div>
      <div className={`${shared.wrap} ${styles.heroIn}`}>
        <div className={styles.heroCopy}>
          <p className={shared.eyebrow}><span className={shared.dot}></span>Vigilância inteligente para empresas</p>
          <h1>{"Invasão detectada, sirene tocando e você avisado. "}<span className={shared.hl}>Em segundos.</span></h1>
          <p className={shared.lead}>{"A Gavions transforma as câmeras da sua empresa em vigilância ativa. A inteligência artificial reconhece pessoas e veículos 24 horas por dia e, no horário protegido, dispara sirene e refletores e chama você no celular, "}<strong>mesmo no modo silencioso</strong>.</p>
          <CtaTarget target="hero" className={styles.ctaRow}>
            <Button as="a" variant="primary" size="large" href="#demonstracao" data-track="cta_hero">{"Agendar demonstração "}<Icon name="arrow" /></Button>
            <Button as="a" variant="ghost" size="large" href="#app" data-track="cta_hero_app"><Icon name="play" />{" Ver o app por dentro"}</Button>
          </CtaTarget>
          <ul className={styles.trust}>
            <li><Icon name="check" />Demonstração sem compromisso</li>
            <li><Icon name="check" />Gravação no seu local, não na nuvem</li>
            <li><Icon name="check" />Funciona com internet 4G</li>
          </ul>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <PhoneFrame><HeroScreen /></PhoneFrame>
          <div className={`${styles.float} ${styles.f1}`}>
            <span className={`${shared.fic} ${shared.red}`}><Icon name="siren" /></span>
            <span><b>Sirene acionada</b><small>Portão · Galpão Central</small></span>
          </div>
          <div className={`${styles.float} ${styles.f2}`}>
            <span className={`${shared.fic} ${shared.amber}`}><Icon name="bulb" /></span>
            <span><b>Refletores acesos</b><small>Automático</small></span>
          </div>
          <div className={`${styles.float} ${styles.f3}`}>
            <span className={`${shared.fic} ${shared.green}`}><Icon name="wa" /></span>
            <span><b>WhatsApp enviado</b><small>com foto do alerta</small></span>
          </div>
        </div>
      </div>
    </section>
  );
}
