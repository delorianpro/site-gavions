"use client";

import { useSyncExternalStore } from "react";

// Match the original: a fixed HTML fallback, then the visitor's year on load.
const getServerSnapshot = () => 2026;
const getSnapshot = () => new Date().getFullYear();
const subscribe = () => () => {};

export function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <span data-year="">{year}</span>;
}
