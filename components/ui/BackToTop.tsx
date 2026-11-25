"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./BackToTop.module.css";

const getScrollSnapshot = () => window.scrollY > 400;
const getServerSnapshot = () => false;
const obstacles = "a, button, input, select, textarea, summary, [role='button'], [data-lead-form], [data-black-friday]";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function BackToTop({ className }: { className?: string }) {
  const positionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pastTop = useSyncExternalStore(subscribeToScroll, getScrollSnapshot, getServerSnapshot);
  const [clear, setClear] = useState(false);
  const visible = pastTop && clear;

  useEffect(() => {
    const position = positionRef.current;
    if (!position) return;

    let observer: IntersectionObserver | undefined;
    let frame = 0;

    function observeObstacles() {
      observer?.disconnect();
      const rect = position!.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      // Observe only the button's footprint, including room for its focus ring.
      const top = Math.max(0, rect.top - 5);
      const right = Math.max(0, width - rect.right - 5);
      const bottom = Math.max(0, height - rect.bottom - 5);
      const left = Math.max(0, rect.left - 5);
      const blocked = new Set<Element>();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            blocked.add(entry.target);
          } else {
            blocked.delete(entry.target);
          }
        }
        setClear(blocked.size === 0);
      }, { rootMargin: `-${top}px -${right}px -${bottom}px -${left}px` });

      document.querySelectorAll(obstacles).forEach(element => {
        if (element !== buttonRef.current) observer!.observe(element);
      });
    }

    function scheduleObservation() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(observeObstacles);
    }

    // Keep the optional control hidden in browsers without collision detection.
    if (typeof IntersectionObserver === "undefined") return;
    scheduleObservation();
    const resizeObserver = new ResizeObserver(scheduleObservation);
    resizeObserver.observe(position);
    window.addEventListener("resize", scheduleObservation);
    window.visualViewport?.addEventListener("resize", scheduleObservation);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleObservation);
      window.visualViewport?.removeEventListener("resize", scheduleObservation);
    };
  }, [className]);

  function scrollToTop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <div ref={positionRef} className={[styles.position, className].filter(Boolean).join(" ")}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        data-visible={visible ? "" : undefined}
        aria-label="Voltar ao topo"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        inert={!visible}
        onClick={scrollToTop}
      >
        <Icon name="arrow" />
      </button>
    </div>
  );
}
