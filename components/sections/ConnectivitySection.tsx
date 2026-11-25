import { Reveal } from "@/components/ui/Reveal";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icons/Icon";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/ConnectivitySection.module.css";

export function ConnectivitySection() {
  return (
    <section className={shared.section} id="internet-4g">
      <div className={`${shared.wrap} ${shared.split} ${shared.rev}`}>
        <Reveal className={styles.dataCard} aria-hidden="true">
          <div className={styles.dcHead}>
            <span className={shared.cic}><Icon name="signal" /></span>
            <span><b>Uso da franquia</b><small>Obra Jardim Europa · chip 4G</small></span>
          </div>
          <p className={styles.dcBig}><b>11,6 GB</b>{" de 30 GB"}</p>
          <div className={styles.bar}>
            <i style={{"width": "39%"} as CSSProperties}></i>
          </div>
          <p className={styles.dcSmall}>Renova em 23/11 · consumo no ritmo previsto</p>
          <div className={styles.dcBars}>
            <i style={{"height": "40%"} as CSSProperties}></i>
            <i style={{"height": "55%"} as CSSProperties}></i>
            <i style={{"height": "35%"} as CSSProperties}></i>
            <i style={{"height": "62%"} as CSSProperties}></i>
            <i style={{"height": "48%"} as CSSProperties}></i>
            <i style={{"height": "30%"} as CSSProperties}></i>
            <i style={{"height": "44%"} as CSSProperties}></i>
            <i style={{"height": "58%"} as CSSProperties}></i>
            <i style={{"height": "37%"} as CSSProperties}></i>
            <i style={{"height": "52%"} as CSSProperties}></i>
            <i style={{"height": "41%"} as CSSProperties}></i>
            <i style={{"height": "33%"} as CSSProperties}></i>
          </div>
          <div className={styles.dcRow}>
            <Icon name="router" />
            <span>Roteador reiniciado automaticamente<small>Internet de volta em 2 min · ontem, 14:08</small></span>
          </div>
        </Reveal>
        <Reveal>
          <p className={shared.eyebrow}>Sem internet fixa?</p>
          <h2>Obra e local isolado também ficam protegidos</h2>
          <p className={shared.sub} data-description="">A Gavions funciona com chip 4G e cuida da sua franquia de dados.</p>
          <ul className={`${shared.ticks} ${styles.ticks}`}>
            <li>Consumo medido no próprio equipamento, no ciclo da sua operadora</li>
            <li>Perto do limite, entra em economia: a gravação continua e só o vídeo pela internet pausa até a franquia renovar</li>
            <li>Alertas, sirene e WhatsApp continuam funcionando durante a economia</li>
            <li>Roteador 4G travou? Com o módulo de relés, a central o reinicia sozinha</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
