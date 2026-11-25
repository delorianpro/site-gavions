import { AppHomeHeader } from "@/components/app-preview/AppHomeHeader";
import { AppNavigation } from "@/components/app-preview/AppNavigation";
import { Icon } from "@/components/icons/Icon";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";

export function HomeScreen() {
  return (
    <>
      <div className={chrome.app}>
        <AppHomeHeader />
        <div className={chrome.appBody}>
          <div className={`${styles.hcard} ${styles.ok}`}>
            <div className={styles.hcardRow}>
              <span className={styles.hstate}><Icon name="shield" />Protegendo</span>
              <span className={styles.mtag}><Icon name="zap" />Automático</span>
            </div>
            <p className={styles.hbig}>6 de 6 pontos protegidos</p>
            <div className={styles.hstats}>
              <span><b>128 h</b>vigilância no mês</span>
              <span><b>14</b>alertas na semana</span>
            </div>
          </div>
          <div className={styles.secTitle}>
            Atividades
          </div>
          <ul className={styles.feed}>
            <li><span className={styles.fdot}><Icon name="bell" /></span><span><b>Sirene silenciada</b><small><em className={styles.who}>
                    Marina
                  </em>{" 02:16"}</small></span></li>
            <li><span className={styles.fdot}><Icon name="bulb" /></span><span><b>Refletores acesos</b><small><em className={`${styles.who} ${styles.auto}`}>
                    Automático
                  </em>{" 02:14"}</small></span></li>
            <li><span className={`${styles.fdot} ${styles.ok}`}><Icon name="shield" /></span><span>{"Proteção ligada em "}<b>todas as áreas</b>{" pelo turno "}<b>Noturno</b><small><em className={`${styles.who} ${styles.auto}`}>
                    Automático
                  </em>{" 18:00"}</small></span></li>
            <li><span className={styles.fdot}><Icon name="hand" /></span><span>{"Controle da proteção: "}<b>Manual</b><small><em className={styles.who}>
                    Ricardo
                  </em>{" 17:42"}</small></span></li>
          </ul>
        </div>
        <AppNavigation active={0} />
      </div>
    </>
  );
}
