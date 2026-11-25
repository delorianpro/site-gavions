"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { useHydrated } from "@/hooks/useHydrated";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track } from "@/lib/analytics";
import shared from "@/components/ui/Primitives.module.css";
import camera from "@/components/app-preview/CameraScene.module.css";
import styles from "./DetectionSimulation.module.css";

type SimulationState = {
  stage: 0 | 1 | 6 | undefined;
  completed: number;
  siren: boolean;
  lit: boolean;
  seconds: number;
};
const idle: SimulationState = { stage: undefined, completed: 0, siren: false, lit: false, seconds: 5 };
type SimulationProps = {
  intro: ReactNode;
  cameraContent: ReactNode;
  steps: { id: string; content: ReactNode }[];
};

export function SimulationPlayer({ intro, cameraContent, steps }: SimulationProps) {
  const [state, setState] = useState<SimulationState>(idle);
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const { ref: observeCamera, inView } = useInView<HTMLElement>({ threshold: 0.4, once: true, fallback: true });
  const timers = useRef<number[]>([]);
  const clock = useRef<number | null>(null);

  const cancel = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    if (clock.current !== null) window.clearInterval(clock.current);
    clock.current = null;
  }, []);

  const play = useCallback(() => {
    cancel();
    if (reducedMotion) {
      setState({ stage: 6, completed: 6, siren: false, lit: true, seconds: 9 });
      return;
    }
    // The idle commit followed by the original 30 ms delay restarts the entry transition.
    setState(idle);
    clock.current = window.setInterval(() => {
      setState((current) => ({ ...current, seconds: Math.min(current.seconds + 1, 59) }));
    }, 1000);
    function at(ms: number, patch: Partial<SimulationState>) {
      timers.current.push(window.setTimeout(() => setState((current) => ({ ...current, ...patch })), ms));
    }
    at(30, { stage: 0 });
    at(1700, { stage: 1, completed: 1 });
    at(2300, { siren: true, completed: 2 });
    at(2900, { lit: true, completed: 3 });
    at(3500, { completed: 4 });
    at(4100, { completed: 5 });
    at(4700, { stage: 6, completed: 6 });
    timers.current.push(window.setTimeout(() => {
      setState((current) => ({ ...current, siren: false }));
      if (clock.current !== null) window.clearInterval(clock.current);
      clock.current = null;
    }, 9000));
  }, [cancel, reducedMotion]);

  useEffect(() => {
    if (!inView) return;
    const start = window.setTimeout(play, 0);
    return () => { window.clearTimeout(start); cancel(); };
  }, [inView, play, cancel]);

  return (
    <div className={[shared.wrap, styles.sim, state.siren && styles.siren, state.lit && styles.lit].filter(Boolean).join(" ")}
      data-stage={state.stage} data-sim-enhanced={hydrated ? "" : undefined}>
      <div className={styles.simCopy}>
        {intro}
        <Reveal className={`${camera.cam} ${styles.simCam}`} elementRef={observeCamera} data-sim-cam="" data-camera="">
          {cameraContent}
          <span className={styles.camTime} data-sim-clock="">02:14:{String(state.seconds).padStart(2, "0")}</span>
          <span className={styles.simFlash} aria-hidden="true"></span>
        </Reveal>
        <Button as="button" variant="ghost" size="small" className={styles.simReplay} type="button" data-sim-replay="" onClick={() => { play(); track("sim_replay", {}); }}>
          <Icon name="play" />{" Simular de novo"}
        </Button>
      </div>
      <Reveal as="ol" className={styles.simSteps} data-sim-steps="">
        {steps.map((step, index) => <li key={step.id} className={index < state.completed ? styles.on : undefined}>{step.content}</li>)}
      </Reveal>
    </div>
  );
}
