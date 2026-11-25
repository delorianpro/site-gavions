import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/AudienceSection.module.css";

export function AudienceSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="para-quem">
      <div className={shared.wrap}>
        <SectionHeading eyebrow="Para quem é" title="Feito para quem não pode ser pego de surpresa" />
        <div className={`${shared.grid} ${shared.g5}`}>
          <FeatureCard delay={0} icon="building" title="Empresas e escritórios" className={styles.seg}>Vigilância fora do expediente e registro de quem liga e desliga a proteção.</FeatureCard>
          <FeatureCard delay={70} icon="warehouse" title="Galpões e indústrias" className={styles.seg}>Pátios grandes, docas e veículos entrando e saindo a noite toda.</FeatureCard>
          <FeatureCard delay={140} icon="hardhat" title="Canteiros de obra" className={styles.seg}>Material caro, local isolado e, muitas vezes, só internet 4G.</FeatureCard>
          <FeatureCard delay={210} icon="store" title="Comércio e lojas" className={styles.seg}>Proteção automática quando a loja fecha, sem depender de alguém lembrar.</FeatureCard>
          <FeatureCard delay={280} icon="layers" title="Redes e franquias" className={styles.seg}>Todas as unidades num painel só, cada pessoa com o acesso certo.</FeatureCard>
        </div>
      </div>
    </section>
  );
}
