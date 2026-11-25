import { Icon } from "@/components/icons/Icon";
import styles from "@/components/app-preview/AppChrome.module.css";

export function AppPropertyHeader() {
  return (
    <div className={styles.appTop}>
      <div className={styles.appSelector}>
        <span className={styles.mapBtn}><Icon name="map" /></span>
        <span className={styles.prop}>Galpão Central<Icon name="chevron" /></span>
      </div>
    </div>
  );
}
