import { Icon } from "@/components/icons/Icon";
import styles from "@/components/app-preview/AppChrome.module.css";

export function AppPropertiesHeader() {
  return (
    <div className={styles.appTop}>
      <div className={styles.appSelector}>
        <span className={`${styles.mapBtn} ${styles.back}`}><Icon name="back" /></span>
        <span className={styles.prop}>Todos os imóveis</span>
      </div>
    </div>
  );
}
