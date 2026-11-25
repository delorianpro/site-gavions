import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "@/components/ui/Primitives.module.css";

export function SecuritySection() {
  return (
    <section className={styles.section} id="seguranca">
      <div className={styles.wrap}>
        <SectionHeading eyebrow="Privacidade e segurança" title="Suas imagens ficam no seu local" />
        <div className={`${styles.grid} ${styles.g4}`}>
          <FeatureCard delay={0} icon="server" title="Gravação local">Os vídeos ficam no equipamento instalado na sua empresa, não numa nuvem de terceiros.</FeatureCard>
          <FeatureCard delay={70} icon="lock" title="Nenhuma porta aberta">A central só faz conexões de saída e o acesso é criptografado. Seu roteador continua fechado.</FeatureCard>
          <FeatureCard delay={140} icon="users" title="Cada um vê só o que pode">Acesso por pessoa e por imóvel, conferido a cada visualização. Revogou, parou de ver.</FeatureCard>
          <FeatureCard delay={210} icon="cloud-off" title="Continua sem internet">Se a conexão cair, gravação, detecção, sirene e refletores seguem funcionando no local.</FeatureCard>
        </div>
      </div>
    </section>
  );
}
