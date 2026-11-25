"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import styles from "./SiteHeader.module.css";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const getSnapshot = () => window.scrollY > 8;
const getServerSnapshot = () => false;

export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <header className={styles.siteHeader} data-header="" data-scrolled={scrolled ? "" : undefined}>{children}</header>;
}
