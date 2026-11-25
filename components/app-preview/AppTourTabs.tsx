"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track, type AppTabId } from "@/lib/analytics";
import styles from "@/components/sections/AppTourSection.module.css";

type TourPanel = { id: string; label: string; icon: ReactNode; content: ReactNode };

export function AppTourTabs({ panels }: { panels: TourPanel[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  function select(index: number, focus: boolean) {
    setActive(index);
    track("app_tab", { tab: `t-${panels[index].id}` as AppTabId });
    const button = buttons.current[index];
    if (!button) return;
    if (focus) button.focus();
    const list = button.parentElement;
    if (list && list.scrollWidth > list.clientWidth) {
      button.scrollIntoView({ block: "nearest", inline: "center", behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % panels.length; break;
      case "ArrowLeft": next = (index - 1 + panels.length) % panels.length; break;
      case "Home": next = 0; break;
      case "End": next = panels.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(next, true);
  }

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Telas do app">
        {panels.map((panel, index) => (
          <button key={panel.id} type="button" role="tab" id={`t-${panel.id}`} aria-controls={`p-${panel.id}`}
            aria-selected={active === index} tabIndex={active === index ? 0 : -1}
            ref={(element) => { buttons.current[index] = element; }}
            onClick={() => select(index, false)} onKeyDown={(event) => onKeyDown(event, index)}>
            {panel.icon}{panel.label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div key={panel.id} className={styles.tour} role="tabpanel" id={`p-${panel.id}`}
          aria-labelledby={`t-${panel.id}`} tabIndex={0} hidden={active !== index}>
          {panel.content}
        </div>
      ))}
    </>
  );
}
