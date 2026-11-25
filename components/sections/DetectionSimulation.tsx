import type { CSSProperties } from "react";
import { CameraScene } from "@/components/app-preview/CameraScene";
import { Icon } from "@/components/icons/Icon";
import shared from "@/components/ui/Primitives.module.css";
import styles from "@/components/sections/DetectionSimulation.module.css";
import camera from "@/components/app-preview/CameraScene.module.css";
import { SimulationPlayer } from "./SimulationPlayer";

export function DetectionSimulation() {
  return (
    <section className={shared.section} id="simulacao">
      <SimulationPlayer
        intro={(<>
          <p className={shared.eyebrow}>Na prática</p>
          <h2>02:14 da madrugada. Alguém pula o portão.</h2>
          <p className={shared.sub} data-description="">Veja o que acontece nos segundos seguintes, sem ninguém olhando as câmeras.</p>
        </>)}
        cameraContent={(<>
          <CameraScene background="gate" figure="person" figureClassName={styles.simPerson} aria-hidden="true" />
            <span className={`${camera.det} ${styles.simDet}`} style={{"--x": "21.5%", "--y": "40%", "--w": "11%", "--h": "50%"} as CSSProperties}><b>pessoa</b></span>
            <span className={styles.camRec}><i></i>REC</span>
            <span className={styles.camLabel}>Portão · Cam 1</span>
        </>)}
        steps={[
          { id: "recognition", content: (<>
            <span className={styles.sic}><Icon name="sparkles" /></span><div>
              <h3>Pessoa reconhecida no Portão</h3>
              <p>A IA confirma que é uma pessoa, não um gato nem uma sombra.</p>
            </div>
          </>) },
          { id: "siren", content: (<>
            <span className={styles.sic}><Icon name="siren" /></span><div>
              <h3>A sirene dispara</h3>
              <p>Pelo tempo que você configurar. Quem entrou sabe que foi visto.</p>
            </div>
          </>) },
          { id: "lights", content: (<>
            <span className={styles.sic}><Icon name="bulb" /></span><div>
              <h3>Os refletores acendem</h3>
              <p>A área fica iluminada e a gravação, mais nítida.</p>
            </div>
          </>) },
          { id: "phone", content: (<>
            <span className={styles.sic}><Icon name="bell" /></span><div>
              <h3>Seu celular toca, mesmo no silencioso</h3>
              <p>Alerta crítico com o local. Um toque abre o vídeo do momento.</p>
            </div>
          </>) },
          { id: "whatsapp", content: (<>
            <span className={styles.sic}><Icon name="wa" /></span><div>
              <h3>WhatsApp com foto</h3>
              <p>O que foi detectado, a câmera, o horário e o link para o painel.</p>
            </div>
          </>) },
          { id: "download", content: (<>
            <span className={styles.sic}><Icon name="download" /></span><div>
              <h3>Vídeo pronto para a polícia e o seguro</h3>
              <p>Baixe o trecho do alerta em MP4 direto no celular.</p>
            </div>
          </>) }
        ]}
      />
      <p className={`${shared.wrap} ${styles.simNote}`}>Sirene, refletores, celular e WhatsApp saem em paralelo: um não espera o outro.</p>
    </section>
  );
}
