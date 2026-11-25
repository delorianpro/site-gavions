import { AppHomeHeader } from "@/components/app-preview/AppHomeHeader";
import { AppNavigation } from "@/components/app-preview/AppNavigation";
import { BrandImage } from "@/components/ui/BrandImage";
import { Icon } from "@/components/icons/Icon";
import hero from "@/components/sections/HeroSection.module.css";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";

export function HeroScreen() {
  return (
    <>
      <div className={hero.push} data-push="">
        <span className={hero.pushIc}><BrandImage variant="icon" alt="" /></span>
        <div>
          <p className={hero.pushApp}>Gavions · agora</p>
          <p className={hero.pushTitle}>Pessoa detectada no Portão</p>
          <p className={hero.pushBody}>Galpão Central · toque para ver o vídeo</p>
        </div>
      </div>
      <div className={chrome.app}>
        <AppHomeHeader />
        <div className={chrome.appBody}>
          <div className={`${styles.hcard} ${styles.ok}`}>
            <div className={styles.hcardRow}>
              <span className={styles.hstate}><Icon name="shield" />Protegendo</span>
              <span className={styles.mtag}><Icon name="zap" />Automático</span>
            </div>
            <p className={styles.hbig}>6 de 6 pontos protegidos</p>
            <p className={styles.hsmall}>Turno Noturno até 06:00</p>
            <div className={styles.slider}>
              <span className={styles.knob}><Icon name="shield" /></span>
              Deslize para desligar
            </div>
          </div>
          <div className={styles.secTitle}>
            {"Últimos alertas "}
            <span>Ver todos</span>
          </div>
          <ul className={styles.alist}>
            <li><span className={styles.oic}><Icon name="person" /></span><span className={styles.atx}><b>Pessoa detectada</b><small>Portão · 02:14</small></span><span className={`${styles.ast} ${styles.pend}`}><Icon name="clock" /></span></li>
            <li><span className={styles.oic}><Icon name="car" /></span><span className={styles.atx}><b>Carro detectado</b><small>Estacionamento · 23:47</small></span><span className={`${styles.ast} ${styles.done}`}><Icon name="check" /></span></li>
            <li><span className={styles.oic}><Icon name="truck" /></span><span className={styles.atx}><b>Caminhão detectado</b><small>Pátio · 19:02</small></span><span className={`${styles.ast} ${styles.done}`}><Icon name="check" /></span></li>
          </ul>
        </div>
        <AppNavigation active={0} />
      </div>
    </>
  );
}
