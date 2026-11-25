import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/icons/Icon";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/MonitoringSection.module.css";

export function MonitoringSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="central">
      <div className={`${shared.wrap} ${shared.split}`}>
        <Reveal>
          <p className={shared.eyebrow}>Central Gavions</p>
          <h2>Você não fica sozinho com o sistema</h2>
          <p className={shared.sub} data-description="">Câmera que para de gravar sem ninguém perceber é o ponto cego de quase todo sistema de segurança. Na Gavions, o equipamento se fiscaliza o tempo todo e nossa equipe acompanha.</p>
          <ul className={styles.rows}>
            <li><span className={shared.cic}><Icon name="activity" /></span><div>
                <h3>Sinal de vida a cada 30 segundos</h3>
                <p>Se o equipamento fica sem energia ou sem internet, a Central fica sabendo.</p>
              </div></li>
            <li><span className={shared.cic}><Icon name="video" /></span><div>
                <h3>Cada câmera conferida de dentro da rede</h3>
                <p>Câmera sem imagem, sem áudio ou com a gravação falhando gera aviso com o nome da área.</p>
              </div></li>
            <li><span className={shared.cic}><Icon name="drive" /></span><div>
                <h3>Disco, temperatura, sirene e refletores</h3>
                <p>Espaço acabando, superaquecimento ou a placa da sirene desconectada também entram na vigilância.</p>
              </div></li>
            <li><span className={shared.cic}><Icon name="bell" /></span><div>
                <h3>Sem susto à toa</h3>
                <p>Um reinício rápido se resolve sozinho. Nossa equipe é avisada em cerca de 1 minuto de falha; você, só se ela continuar.</p>
              </div></li>
          </ul>
        </Reveal>
        <Reveal className={styles.panel} aria-hidden="true">
          <div className={styles.panelHead}>
            <span><b>Galpão Central</b><small>Saúde da instalação</small></span>
            <span className={`${styles.pill} ${styles.ok}`}><i></i>Online</span>
          </div>
          <ul className={styles.health}>
            <li><Icon name="server" />Equipamento<span>último sinal há 12 s</span><em className={styles.ok}>
                ok
              </em></li>
            <li><Icon name="video" />Câmeras gravando<span>6 de 6</span><em className={styles.ok}>
                ok
              </em></li>
            <li><Icon name="activity" />Áudio das câmeras<span>6 de 6</span><em className={styles.ok}>
                ok
              </em></li>
            <li><Icon name="drive" />Armazenamento<span>58% livre</span><em className={styles.ok}>
                ok
              </em></li>
            <li><Icon name="siren" />Sirene e refletores<span>conectados</span><em className={styles.ok}>
                ok
              </em></li>
            <li><Icon name="router" />Internet<span>banda larga</span><em className={styles.ok}>
                ok
              </em></li>
          </ul>
          <div className={styles.incident}>
            <span className={`${shared.fic} ${shared.amber}`}><Icon name="alert" /></span>
            <span><b>Doca · Cam 6 sem imagem</b><small>03:12 · equipe avisada · resolvido 03:19</small></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
