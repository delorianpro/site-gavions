import { Icon } from "@/components/icons/Icon";
import styles from "./AppChrome.module.css";

export function AppNavigation({ active }: { active: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <nav className={styles.appNav}>
      <span className={active === 0 ? styles.on : undefined}><Icon name="home" />Início</span>
      <span className={active === 1 ? styles.on : undefined}><Icon name="video" />Câmeras</span>
      <span className={active === 2 ? styles.on : undefined}><Icon name="bell" />Alertas</span>
      <span className={active === 3 ? styles.on : undefined}><Icon name="shield" />Proteção</span>
      <span className={active === 4 ? styles.on : undefined}><Icon name="account" />Conta</span>
    </nav>
  );
}
