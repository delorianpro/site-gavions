import { BrandImage } from "@/components/ui/BrandImage";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/app-preview/AppChrome.module.css";

export function AppHomeHeader() {
  return (
    <div className={styles.appTop}>
      <div className={styles.appBrand}>
        <BrandImage variant="name" alt="" />
        <span className={styles.avatar}>MS</span>
      </div>
      <div className={styles.appSelector}>
        <span className={styles.mapBtn}><Icon name="map" /></span>
        <span className={styles.prop}>Galpão Central<Icon name="chevron" /></span>
      </div>
    </div>
  );
}
