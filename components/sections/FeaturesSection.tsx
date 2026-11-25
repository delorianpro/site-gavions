import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "@/components/ui/Primitives.module.css";

export function FeaturesSection() {
  return (
    <section className={styles.section} id="recursos">
      <div className={styles.wrap}>
        <SectionHeading eyebrow="Recursos" title="Tudo o que a segurança da sua empresa precisa" />
        <div className={`${styles.grid} ${styles.g3}`}>
          <FeatureCard delay={0} icon="sparkles" title="Detecção por inteligência artificial">Pessoas, carros, motos, bicicletas, ônibus, caminhões, cães e gatos. Você escolhe quais objetos geram alerta.</FeatureCard>
          <FeatureCard delay={70} icon="bell" title="Alerta que fura o silencioso">No Android toca no volume de alarme; no iPhone chega como alerta crítico. De madrugada, você acorda.</FeatureCard>
          <FeatureCard delay={140} icon="wa" title="WhatsApp com foto">Mensagem com o que foi visto, a câmera, o horário e o link do painel, no texto que você preferir.</FeatureCard>
          <FeatureCard delay={210} icon="siren" title="Sirene e refletores automáticos">Disparam junto com o alerta. A sirene tem tempo limite configurável e silencia pelo app; os refletores apagam sozinhos.</FeatureCard>
          <FeatureCard delay={280} icon="clock" title="Turnos por câmera">Até seis períodos por dia, inclusive virando a madrugada. Cada câmera no seu turno, e feriados por programação especial.</FeatureCard>
          <FeatureCard delay={0} icon="video" title="Ao vivo e histórico">Linha do tempo com os alertas marcados, zoom, tela cheia, áudio e captura de foto do que está na tela.</FeatureCard>
          <FeatureCard delay={70} icon="download" title="A prova no seu celular">Baixe o vídeo do alerta em MP4 ou escolha o trecho exato da gravação. Vai direto para a galeria.</FeatureCard>
          <FeatureCard delay={140} icon="layers" title="Vários imóveis, um login">Matriz, filiais e obras no mesmo app, com um painel que resume todos e mostra onde agir.</FeatureCard>
          <FeatureCard delay={210} icon="users" title="Equipe com acesso controlado">Titular, administrador ou membro, imóvel por imóvel. Alguém saiu da empresa? O acesso cai na hora.</FeatureCard>
        </div>
      </div>
    </section>
  );
}
