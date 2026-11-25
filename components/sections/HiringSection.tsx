import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "@/components/ui/Primitives.module.css";

export function HiringSection() {
  return (
    <section className={styles.section} id="contratacao">
      <div className={styles.wrap}>
        <SectionHeading eyebrow="Contratação" title="Simples de contratar, previsível de pagar" />
        <div className={`${styles.grid} ${styles.g3}`}>
          <FeatureCard delay={0} icon="wrench" title="Proposta sob medida">Entendemos o seu local, as câmeras que você já tem e o que falta: sirene, refletores, conexão.</FeatureCard>
          <FeatureCard delay={70} icon="calendar" title="Mensalidade por imóvel">Valor fixo por mês, com o vencimento no dia que for melhor para você.</FeatureCard>
          <FeatureCard delay={140} icon="receipt" title="Uma fatura, paga por PIX">Imóveis com o mesmo vencimento saem numa fatura só, com QR Code PIX e lembrete antes do vencimento.</FeatureCard>
        </div>
      </div>
    </section>
  );
}
