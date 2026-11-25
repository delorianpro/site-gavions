import { AppNavigation } from "@/components/app-preview/AppNavigation";
import { AppPropertyHeader } from "@/components/app-preview/AppPropertyHeader";
import { CameraScene } from "@/components/app-preview/CameraScene";
import { Icon } from "@/components/icons/Icon";
import chrome from "@/components/app-preview/AppChrome.module.css";
import styles from "@/components/app-preview/AppWidgets.module.css";
import camera from "@/components/app-preview/CameraScene.module.css";

export function CamerasScreen() {
  return (
    <>
      <div className={chrome.app}>
        <AppPropertyHeader />
        <div className={chrome.appBody}>
          <div className={styles.camsHead}>
            <span><b>5 de 6</b>{" pontos protegidos"}</span>
            <span className={styles.camsTool}><Icon name="grid" /></span>
          </div>
          <div className={styles.camGrid}>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="gate" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Portão</b><small>Cam 1 · Noturno</small></span>
                <span className={`${styles.sw} ${styles.on}`}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
            </figure>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="park" figure="car" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Estacionamento</b><small>Cam 2 · Noturno</small></span>
                <span className={`${styles.sw} ${styles.on}`}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
            </figure>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="ware" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Depósito</b><small>Cam 3 · Noturno</small></span>
                <span className={`${styles.sw} ${styles.on}`}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
            </figure>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="recep" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Recepção</b><small>Protege às 22:00</small></span>
                <span className={styles.sw}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.off}`}>Sem proteção</span>
            </figure>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="site" figure="truck" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Pátio</b><small>Cam 5 · Noturno</small></span>
                <span className={`${styles.sw} ${styles.on}`}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
            </figure>
            <figure className={styles.ccard}>
              <div className={camera.cam} data-camera="">
                <CameraScene background="park" />
                <span className={styles.live}>AO VIVO</span>
              </div>
              <figcaption>
                <span><b>Doca</b><small>Cam 6 · Noturno</small></span>
                <span className={`${styles.sw} ${styles.on}`}></span>
              </figcaption>
              <span className={`${styles.pb} ${styles.ok}`}>Protegendo</span>
            </figure>
          </div>
        </div>
        <AppNavigation active={1} />
      </div>
    </>
  );
}
