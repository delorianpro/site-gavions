import { HeaderShell } from "./HeaderShell";
import { BlackFridayCampaign } from "./BlackFridayCampaign";
import { BrandImage } from "@/components/ui/BrandImage";
import { Button } from "@/components/ui/Button";
import styles from "@/components/layout/SiteHeader.module.css";
import shared from "@/components/ui/Primitives.module.css";

export function SiteHeader() {
  return (
    <>
      <a className={styles.skip} href="#conteudo">Pular para o conteúdo</a>
      <BlackFridayCampaign variant="mobile" />
      <HeaderShell>
        <div className={`${shared.wrap} ${styles.headerIn}`}>
          <a className={styles.brand} href="#topo" aria-label="Gavions, início da página"><BrandImage variant="icon" className={styles.brandIcon} alt="" /><BrandImage variant="name" className={styles.brandName} alt="Gavions" /></a>
          <nav className={styles.nav} aria-label="Seções">
            <a href="#como-funciona">Como funciona</a>
            <a href="#app">O app</a>
            <a href="#recursos">Recursos</a>
            <a href="#central">Central</a>
            <a href="#perguntas">Dúvidas</a>
          </nav>
          <Button as="a" variant="primary" size="small" href="#demonstracao" data-track="cta_header"><span>Agendar<span className={styles.btnMore}>{" demonstração"}</span></span></Button>
        </div>
      </HeaderShell>
    </>
  );
}
