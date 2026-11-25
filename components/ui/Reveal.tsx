"use client";

import { useCallback, type CSSProperties, type HTMLAttributes } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./Reveal.module.css";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "li" | "ol";
  delay?: number;
  elementRef?: (element: HTMLElement | null) => void;
};

export function Reveal({ as: Tag = "div", delay = 0, elementRef, className, style, ...props }: RevealProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const enhanced = hydrated && !reducedMotion && typeof IntersectionObserver !== "undefined";
  const { ref, inView } = useInView<HTMLElement>({
    threshold: 0.08, rootMargin: "0px 0px -8% 0px", once: true, disabled: !enhanced,
  });
  const attach = useCallback((element: HTMLElement | null) => {
    ref(element);
    elementRef?.(element);
  }, [ref, elementRef]);

  return (
    <Tag {...props} ref={attach} className={[className, styles.reveal].filter(Boolean).join(" ")}
      data-reveal-state={enhanced ? inView ? "visible" : "pending" : undefined}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties} />
  );
}
