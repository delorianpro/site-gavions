import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/ComparisonSection.module.css";

export function ComparisonSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="comparativo">
      <div className={shared.wrap}>
        <SectionHeading eyebrow="Comparativo" title="Câmera com DVR comum ou Gavions?" />
        <Reveal className={styles.tableWrap}>
          <table className={styles.compare}>
            <thead>
              <tr>
                <th scope="col"><span className={shared.sr}>Recurso</span></th>
                <th scope="col">DVR comum</th>
                <th scope="col" className={styles.us}>Gavions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Grava 24 horas</th>
                <td><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Diferencia pessoa e veículo de sombra e folha</th>
                <td><span className={styles.p}>Só movimento</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Dispara sirene e refletores sozinho</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Alerta que toca no modo silencioso</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">WhatsApp com foto do alerta</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Proteção por turno em cada câmera</th>
                <td><span className={styles.p}>Limitado</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Equipe avisada quando uma câmera para</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Vários imóveis com um login</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
              <tr>
                <th scope="row">Acesso remoto sem abrir portas no roteador</th>
                <td><span className={styles.n} role="img" aria-label="Não">—</span></td>
                <td className={styles.us}><span className={styles.y} role="img" aria-label="Sim">✓</span></td>
              </tr>
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
