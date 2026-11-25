import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "@/components/ui/Primitives.module.css";

export function ProblemSection() {
  return (
    <section className={styles.section} id="problema">
      <div className={styles.wrap}>
        <SectionHeading eyebrow="O problema" title="Ter câmera não é o mesmo que estar protegido" description="A maioria dos sistemas só grava. Quando alguém assiste à gravação, o prejuízo já aconteceu." />
        <div className={`${styles.grid} ${styles.g4}`}>
          <FeatureCard delay={0} icon="eye-off" title="Ninguém está olhando" warning>O DVR grava a madrugada inteira, mas a invasão só aparece quando alguém abre a gravação na manhã seguinte.</FeatureCard>
          <FeatureCard delay={70} icon="bell" title="Alarme falso toda hora" warning>Detector de movimento dispara com folha, sombra e chuva. Em uma semana ninguém mais olha as notificações.</FeatureCard>
          <FeatureCard delay={140} icon="alert" title="Câmera parada e ninguém sabe" warning>Cabo solto, queda de energia, HD cheio. Você só descobre que não havia gravação no dia em que precisa dela.</FeatureCard>
          <FeatureCard delay={210} icon="lock" title="Acesso complicado e inseguro" warning>Senha do DVR anotada no papel, porta aberta no roteador e vídeo que não carrega fora da empresa.</FeatureCard>
        </div>
      </div>
    </section>
  );
}
