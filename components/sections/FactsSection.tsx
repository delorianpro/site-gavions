import styles from "@/components/sections/FactsSection.module.css";
import shared from "@/components/ui/Primitives.module.css";

export function FactsSection() {
  return (
    <section className={styles.facts} aria-label="Gavions em números">
      <div className={`${shared.wrap} ${styles.factsIn}`}>
        <div className={styles.fact}>
          <b>24 h</b>
          <span>de análise contínua por IA em todas as câmeras</span>
        </div>
        <div className={styles.fact}>
          <b>8</b>
          <span>tipos de objetos reconhecidos pela IA, incluindo pessoas, veículos e animais.</span>
        </div>
        <div className={styles.fact}>
          <b>30 s</b>
          <span>entre cada sinal de vida enviado à Central Gavions</span>
        </div>
      </div>
    </section>
  );
}
