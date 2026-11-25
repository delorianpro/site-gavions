import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/icons/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/FaqSection.module.css";

export function FaqSection() {
  return (
    <section className={`${shared.section} ${shared.alt}`} id="perguntas">
      <div className={`${shared.wrap} ${shared.narrow}`}>
        <SectionHeading eyebrow="Dúvidas frequentes" title="Perguntas que ouvimos de quem está decidindo" />
        <Reveal className={styles.faq}>
          <details>
            <summary>Preciso trocar as câmeras que já tenho?<Icon name="plus" /></summary>
            <p>Nem sempre. Avaliamos as câmeras que você já tem: câmeras IP compatíveis podem ser aproveitadas. Se faltar alguma, indicamos o que instalar.</p>
          </details>
          <details>
            <summary>Minhas imagens vão para a nuvem?<Icon name="plus" /></summary>
            <p>Não. As gravações ficam no equipamento instalado no seu local. Quando você assiste pelo app, o vídeo passa por uma conexão criptografada, e só quem tem acesso liberado consegue ver.</p>
          </details>
          <details>
            <summary>E se a internet cair?<Icon name="plus" /></summary>
            <p>A gravação, a detecção, a sirene e os refletores continuam funcionando no local. A Central Gavions percebe que o equipamento ficou sem comunicação e acompanha até ele voltar.</p>
          </details>
          <details>
            <summary>E se faltar energia?<Icon name="plus" /></summary>
            <p>Quando a energia volta, o sistema sobe sozinho e retoma a proteção conforme os turnos configurados. A queda e a volta ficam registradas, e a Central é avisada.</p>
          </details>
          <details>
            <summary>Funciona onde não há internet fixa, como uma obra?<Icon name="plus" /></summary>
            <p>Sim. Funciona com chip 4G, mede o consumo da franquia e entra em economia perto do limite, sem parar de gravar. Com o módulo de relés, reinicia sozinho o roteador quando a internet trava.</p>
          </details>
          <details>
            <summary>Vou receber alerta de gato, cachorro ou carro passando?<Icon name="plus" /></summary>
            <p>Só se você quiser. Você escolhe quais objetos geram alerta, e cada câmera só alerta nos horários em que está protegendo.</p>
          </details>
          <details>
            <summary>Por quanto tempo as gravações ficam guardadas?<Icon name="plus" /></summary>
            <p>Definimos o período com você, conforme o número de câmeras e o armazenamento instalado. O app mostra a retenção de gravação contínua e de alertas do seu imóvel.</p>
          </details>
          <details>
            <summary>Posso dar acesso à minha equipe?<Icon name="plus" /></summary>
            <p>Sim. Cada pessoa tem o próprio login e vê só os imóveis liberados para ela, como titular, administrador ou membro. Para tirar alguém, basta suspender o acesso.</p>
          </details>
          <details>
            <summary>Tenho mais de uma unidade. Preciso de vários apps?<Icon name="plus" /></summary>
            <p>Não. Com um login você troca de imóvel no próprio app e tem um painel com todos eles.</p>
          </details>
          <details>
            <summary>Funciona no Android e no iPhone?<Icon name="plus" /></summary>
            <p>Sim, nos dois, e também pelo navegador do computador.</p>
          </details>
          <details>
            <summary>Como é cobrado?<Icon name="plus" /></summary>
            <p>Mensalidade por imóvel, com o vencimento que você escolher. O valor depende do seu local e entra na proposta. Imóveis com o mesmo vencimento saem numa fatura só, paga por PIX.</p>
          </details>
        </Reveal>
      </div>
    </section>
  );
}
