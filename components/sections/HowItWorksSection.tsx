import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/icons/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/HowItWorksSection.module.css";

export function HowItWorksSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="como-funciona">
      <div className={shared.wrap}>
        <SectionHeading eyebrow="Como funciona" title="Da câmera ao seu celular, sem ninguém precisar ficar olhando" />
        <ol className={styles.steps}>
          <Reveal as="li" delay={0} className={styles.step}><span className={styles.snum}>1</span><span className={shared.cic}><Icon name="wrench" /></span><h3>Instalamos a central no seu local</h3><p>Um equipamento Gavions fica na mesma rede das câmeras. Ele encontra as câmeras compatíveis, grava e analisa tudo ali mesmo.</p></Reveal>
          <Reveal as="li" delay={70} className={styles.step}><span className={styles.snum}>2</span><span className={shared.cic}><Icon name="sparkles" /></span><h3>A IA vigia cada câmera, 24 horas</h3><p>Reconhece pessoas, carros, motos, bicicletas, ônibus, caminhões, cães e gatos. Sombra, folha e chuva não viram alerta.</p></Reveal>
          <Reveal as="li" delay={140} className={styles.step}><span className={styles.snum}>3</span><span className={shared.cic}><Icon name="siren" /></span><h3>Reage no horário protegido</h3><p>Nos turnos que você definir, uma detecção dispara ao mesmo tempo sirene, refletores, alerta no celular e WhatsApp com foto.</p></Reveal>
          <Reveal as="li" delay={210} className={styles.step}><span className={styles.snum}>4</span><span className={shared.cic}><Icon name="headset" /></span><h3>A Central Gavions acompanha</h3><p>O equipamento envia sinal de vida a cada 30 segundos. Se algo para de funcionar, nossa equipe fica sabendo e age.</p></Reveal>
        </ol>
      </div>
    </section>
  );
}
