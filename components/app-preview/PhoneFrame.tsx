import type { ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

type PhoneFrameProps = { children: ReactNode; "aria-hidden"?: "true" | "false" | boolean };

export function PhoneFrame({ children, "aria-hidden": ariaHidden }: PhoneFrameProps) {
  return <div className={styles.phone} data-phone="" aria-hidden={ariaHidden}><div className={styles.phoneScreen}>{children}</div></div>;
}
