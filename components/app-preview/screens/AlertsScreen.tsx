import type { CSSProperties } from "react";
import { AppNavigation } from "@/components/app-preview/AppNavigation";
import { AppPropertyHeader } from "@/components/app-preview/AppPropertyHeader";
import { CameraScene } from "@/components/app-preview/CameraScene";
import { Icon } from "@/components/icons/Icon";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";
import camera from "@/components/app-preview/CameraScene.module.css";

export function AlertsScreen() {
  return (
    <>
      <div className={chrome.app}>
        <AppPropertyHeader />
        <div className={chrome.appBody}>
          <div className={styles.chips}>
            <span className={`${styles.chip} ${styles.on}`}>Todos</span>
            <span className={styles.chip}>{"Pendentes "}<i>
                2
              </i></span>
            <span className={styles.chip}>Pessoas</span>
            <span className={styles.chip}>Veículos</span>
          </div>
          <div className={styles.rlist}>
            <figure className={styles.rcard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="gate" figure="person" />
                <span className={camera.det} style={{"--x": "21.5%", "--y": "40%", "--w": "11%", "--h": "50%"} as CSSProperties}></span>
              </div>
              <figcaption>
                <span className={styles.rtop}><span className={`${styles.oic} ${styles.sm}`}><Icon name="person" /></span><span className={`${styles.rb} ${styles.pend}`}>Pendente</span></span>
                <b>Portão</b>
                <small>Hoje, 02:14 · há 6 min</small>
              </figcaption>
            </figure>
            <figure className={styles.rcard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="ware" figure="person" figureTransform="translate(45 6) scale(.85)" />
                <span className={camera.det} style={{"--x": "46%", "--y": "41%", "--w": "10%", "--h": "42%"} as CSSProperties}></span>
              </div>
              <figcaption>
                <span className={styles.rtop}><span className={`${styles.oic} ${styles.sm}`}><Icon name="person" /></span><span className={`${styles.rb} ${styles.pend}`}>Pendente</span></span>
                <b>Depósito</b>
                <small>Hoje, 01:58 · há 22 min</small>
              </figcaption>
            </figure>
            <figure className={styles.rcard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="park" figure="car" />
                <span className={camera.det} style={{"--x": "42%", "--y": "50%", "--w": "38%", "--h": "35%"} as CSSProperties}></span>
              </div>
              <figcaption>
                <span className={styles.rtop}><span className={`${styles.oic} ${styles.sm}`}><Icon name="car" /></span><span className={`${styles.rb} ${styles.done}`}>Revisado</span></span>
                <b>Estacionamento</b>
                <small>Ontem, 23:47</small>
              </figcaption>
            </figure>
          </div>
        </div>
        <AppNavigation active={2} />
      </div>
    </>
  );
}
