"use client";

import { useSyncExternalStore } from "react";
import { blackFridayClock, formatBlackFridayCountdown } from "@/lib/black-friday";
import styles from "./BlackFridayCampaign.module.css";

export function BlackFridayCountdown() {
  const remaining = useSyncExternalStore(blackFridayClock.subscribe, blackFridayClock.getSnapshot, blackFridayClock.getServerSnapshot);
  const countdown = remaining === null
    ? { time: "---:--:--", label: "Calculando tempo restante da campanha" }
    : formatBlackFridayCountdown(remaining);

  return (
    <div className={styles.countdown} data-black-friday-countdown="">
      <span className={styles.ends}>TERMINA EM</span>
      <span className={styles.time} aria-label={countdown.label}>{countdown.time}</span>
      <span className={styles.units} aria-hidden="true">
        <span>HOR</span><span>MIN</span><span>SEG</span>
      </span>
    </div>
  );
}
