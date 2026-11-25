import { Reveal } from "@/components/ui/Reveal";
import { AppTourTabs } from "@/components/app-preview/AppTourTabs";
import { AlertsScreen } from "@/components/app-preview/screens/AlertsScreen";
import { CamerasScreen } from "@/components/app-preview/screens/CamerasScreen";
import { HomeScreen } from "@/components/app-preview/screens/HomeScreen";
import { Icon } from "@/components/icons/Icon";
import { PhoneFrame } from "@/components/app-preview/PhoneFrame";
import { PropertiesScreen } from "@/components/app-preview/screens/PropertiesScreen";
import { ProtectionScreen } from "@/components/app-preview/screens/ProtectionScreen";
import { SectionHeading } from "@/components/ui/SectionHeading";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/AppTourSection.module.css";

export function AppTourSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="app">
      <div className={shared.wrap}>
        <SectionHeading eyebrow="O app" title="A segurança da empresa na palma da mão" description="Simples para quem não tem tempo de ficar olhando câmera. No Android, no iPhone e no navegador do computador." />
        <AppTourTabs panels={[
          { id: "inicio", label: "Início", icon: <Icon name="home" />, content: (<>
          <Reveal className={styles.tourCopy}>
            <h3>Tudo numa olhada</h3>
            <p>Abra o app e saiba na hora se a empresa está protegida, o que aconteceu de madrugada e quem mexeu na proteção.</p>
            <ul className={shared.ticks}>
              <li>Estado da proteção em verde ou laranja, sem dúvida</li>
              <li>Últimos alertas com um toque até o vídeo</li>
              <li>Atividades com o nome de quem ligou, desligou ou silenciou a sirene</li>
              <li>Horas de vigilância e alertas do mês</li>
            </ul>
          </Reveal>
          <PhoneFrame aria-hidden="true"><HomeScreen /></PhoneFrame>
          </>) },
          { id: "cameras", label: "Câmeras", icon: <Icon name="video" />, content: (<>
          <Reveal className={styles.tourCopy}>
            <h3>Ao vivo, de qualquer lugar</h3>
            <p>Todas as câmeras do imóvel numa tela, cada uma com o nome da área, e a proteção de cada ponto na ponta do dedo.</p>
            <ul className={shared.ticks}>
              <li>Lista ou grade, na ordem que você preferir</li>
              <li>Ligue ou desligue a proteção de uma câmera com um toque</li>
              <li>Tela cheia, zoom, áudio e foto do que está na tela</li>
              <li>Histórico com linha do tempo e os alertas marcados</li>
            </ul>
          </Reveal>
          <PhoneFrame aria-hidden="true"><CamerasScreen /></PhoneFrame>
          </>) },
          { id: "alertas", label: "Alertas", icon: <Icon name="bell" />, content: (<>
          <Reveal className={styles.tourCopy}>
            <h3>Só o que importa, pronto para baixar</h3>
            <p>Cada alerta vem com a imagem, a área e o horário. Você escolhe o que gera alerta e encontra o momento certo em segundos.</p>
            <ul className={shared.ticks}>
              <li>Filtros por pessoas, veículos e alertas ainda não vistos</li>
              <li>Linha do tempo com velocidade de 0,5x a 16x</li>
              <li>Vídeo do alerta em MP4, ou vários de uma vez</li>
              <li>Você decide: pessoas, veículos, animais ou tudo</li>
            </ul>
          </Reveal>
          <PhoneFrame aria-hidden="true"><AlertsScreen /></PhoneFrame>
          </>) },
          { id: "protecao", label: "Proteção", icon: <Icon name="shield" />, content: (<>
          <Reveal className={styles.tourCopy}>
            <h3>Protegida nos horários certos, sem ninguém lembrar de ligar</h3>
            <p>Defina turnos por câmera e deixe a Gavions ligar e desligar a proteção sozinha. Precisa mudar algo hoje? Assuma o controle com um gesto.</p>
            <ul className={shared.ticks}>
              <li>Turnos prontos (Noturno, Diurno, Escala 5x2) ou do seu jeito</li>
              <li>Programações especiais para feriados, férias e eventos</li>
              <li>Automático ou manual, e pausa com hora para voltar</li>
              <li>Os próximos comportamentos aparecem antes de acontecer</li>
            </ul>
          </Reveal>
          <PhoneFrame aria-hidden="true"><ProtectionScreen /></PhoneFrame>
          </>) },
          { id: "imoveis", label: "Vários imóveis", icon: <Icon name="layers" />, content: (<>
          <Reveal className={styles.tourCopy}>
            <h3>Matriz, filiais e obras com um login só</h3>
            <p>Quem cuida de vários endereços enxerga tudo num painel e troca de imóvel sem sair do app.</p>
            <ul className={shared.ticks}>
              <li>Resumo da conta: protegidos, câmeras gravando, alertas da semana</li>
              <li>“Precisam de atenção” mostra onde agir primeiro</li>
              <li>Troca de imóvel no próprio app, sem novo login</li>
              <li>Cada pessoa da equipe vê só os imóveis liberados para ela</li>
            </ul>
          </Reveal>
          <PhoneFrame aria-hidden="true"><PropertiesScreen /></PhoneFrame>
          </>) }
        ]} />
        <p className={styles.tourNote}>Telas ilustrativas. Nomes, números e imagens são exemplos.</p>
      </div>
    </section>
  );
}
