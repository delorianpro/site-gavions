"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

export type CtaTargetName = "hero" | "demo";
type Visibility = { hero: boolean; demo: boolean };
type Action = { target: CtaTargetName; visible: boolean };
type CtaVisibility = Visibility & { setVisibility: (target: CtaTargetName, visible: boolean) => void };
const Context = createContext<CtaVisibility | null>(null);

function reducer(state: Visibility, { target, visible }: Action): Visibility {
  return state[target] === visible ? state : { ...state, [target]: visible };
}

export function CtaVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibility, dispatch] = useReducer(reducer, { hero: true, demo: false });
  const setVisibility = useCallback((target: CtaTargetName, visible: boolean) => dispatch({ target, visible }), []);
  const value = useMemo(() => ({ ...visibility, setVisibility }), [visibility, setVisibility]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCtaVisibility() {
  const value = useContext(Context);
  if (!value) throw new Error("CTA visibility requires CtaVisibilityProvider.");
  return value;
}
