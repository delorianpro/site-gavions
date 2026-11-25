"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHydrated } from "./useHydrated";

type InViewOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  disabled?: boolean;
  initial?: boolean;
  fallback?: boolean;
  onChange?: (visible: boolean) => void;
};

export function useInView<T extends Element>({
  threshold = 0,
  rootMargin = "0px",
  once = false,
  disabled = false,
  initial = false,
  fallback = initial,
  onChange,
}: InViewOptions = {}) {
  const target = useRef<T | null>(null);
  const seen = useRef(false);
  const [visible, setVisible] = useState(initial);
  const hydrated = useHydrated();
  const supported = hydrated && typeof IntersectionObserver !== "undefined";
  const ref = useCallback((element: T | null) => { target.current = element; }, []);

  useEffect(() => {
    if (!supported || disabled || (once && seen.current) || !target.current) return;
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (!active) return;
      const entry = entries[0];
      if (!entry) return;
      // Match the original observer callbacks, including their isIntersecting test.
      const inView = entry.isIntersecting;
      setVisible(inView);
      onChange?.(inView);
      if (once && inView) {
        seen.current = true;
        observer.disconnect();
      }
    }, { threshold, rootMargin });
    observer.observe(target.current);
    return () => { active = false; observer.disconnect(); };
  }, [supported, disabled, once, threshold, rootMargin, onChange]);

  return { ref, inView: supported ? visible : hydrated ? fallback : initial, supported };
}
