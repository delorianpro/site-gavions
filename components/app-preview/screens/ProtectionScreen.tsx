import { AppNavigation } from "@/components/app-preview/AppNavigation";
import { AppPropertyHeader } from "@/components/app-preview/AppPropertyHeader";
import { Icon } from "@/components/icons/Icon";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";

export function ProtectionScreen() {
  return (
    <>
      <div className={chrome.app}>
        <AppPropertyHeader />
        <div className={chrome.appBody}>
          <p className={styles.segTitle}>Controle da proteção</p>
          <div className={styles.seg}>
            <span className={styles.on}><Icon name="zap" />Automático</span>
            <span><Icon name="hand" />Manual</span>
          </div>
          <div className={`${styles.hcard} ${styles.ok} ${styles.compact}`}>
            <div className={styles.hcardRow}>
              <span className={styles.hstate}><Icon name="shield" />Protegendo</span>
            </div>
            <p className={styles.hsmall}>{"Todas as áreas protegidas pelos turnos "}<b>Noturno</b>{" e "}<b>24 horas</b>.</p>
            <p className={styles.nbTitle}>Próximos comportamentos</p>
            <div className={styles.nb}>
              <span className={styles.nbT}><b>06:00</b>hoje</span>
              <span className={styles.nbA}><span className={`${styles.mini} ${styles.off}`}><Icon name="shield-off" /></span>Desliga Recepção, Depósito e Doca</span>
            </div>
            <div className={styles.nb}>
              <span className={styles.nbT}><b>18:00</b>hoje</span>
              <span className={styles.nbA}><span className={`${styles.mini} ${styles.ok}`}><Icon name="shield" /></span>Protege todas as áreas</span>
            </div>
          </div>
          <ul className={styles.links}>
            <li><span className={styles.lic}><Icon name="person" /></span>Objetos monitorados<Icon name="chevron-r" className={styles.chev} /></li>
            <li><span className={styles.lic}><Icon name="clock" /></span>Turnos de proteção<Icon name="chevron-r" className={styles.chev} /></li>
            <li><span className={styles.lic}><Icon name="flag" /></span>Programações especiais<Icon name="chevron-r" className={styles.chev} /></li>
            <li><span className={styles.lic}><Icon name="bulb" /></span>Dispositivos<Icon name="chevron-r" className={styles.chev} /></li>
          </ul>
        </div>
        <AppNavigation active={3} />
      </div>
    </>
  );
}
