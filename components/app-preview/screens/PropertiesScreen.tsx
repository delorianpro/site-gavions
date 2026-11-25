import { AppPropertiesHeader } from "@/components/app-preview/AppPropertiesHeader";
import { CameraScene } from "@/components/app-preview/CameraScene";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";

export function PropertiesScreen() {
  return (
    <>
      <div className={chrome.app}>
        <AppPropertiesHeader />
        <div className={chrome.appBody}>
          <div className={styles.kpis}>
            <span><b>2 de 3</b>protegidos</span>
            <span><b>17</b>câmeras gravando</span>
            <span><b>23</b>alertas na semana</span>
            <span><b>412 h</b>vigilância no mês</span>
          </div>
          <div className={styles.secTitle}>
            Precisam de atenção
          </div>
          <div className={`${styles.pcard} ${styles.warn}`}>
            <span className={styles.pthumb}><CameraScene background="site" /></span>
            <span><b>Obra Jardim Europa</b><small>2 alertas a revisar</small></span>
            <span className={`${styles.pb} ${styles.off}`}>Sem proteção</span>
          </div>
          <div className={styles.secTitle}>
            Seus imóveis
          </div>
          <div className={styles.pcard}>
            <span className={styles.pthumb}><CameraScene background="gate" /></span>
            <span><b>Galpão Central</b><small>6 câmeras · selecionado</small></span>
            <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
          </div>
          <div className={styles.pcard}>
            <span className={styles.pthumb}><CameraScene background="recep" /></span>
            <span><b>Loja Centro</b><small>5 câmeras</small></span>
            <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
          </div>
        </div>
      </div>
    </>
  );
}
