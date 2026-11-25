"use client";

import { useCallback, useEffect, useRef } from "react";
import { attributionKeys, type Attribution } from "@/lib/leads/types";

export function useLeadAttribution() {
  const origin = useRef<Attribution>({});
  useEffect(() => {
    const result: Attribution = {};
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem("dlp_origem") || "null");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        for (const key of attributionKeys) {
          const value = (stored as Record<string, unknown>)[key];
          if (typeof value === "string") result[key] = value.slice(0, key === "landing" || key === "referrer" ? 300 : 200);
        }
      }
    } catch { /* Capture current attribution even when storage fails. */ }
    const params = new URLSearchParams(window.location.search);
    for (const key of attributionKeys.slice(0, 7)) {
      const value = params.get(key);
      if (value) result[key] = value.slice(0, 200);
    }
    if (!result.referrer && document.referrer) result.referrer = document.referrer.slice(0, 300);
    if (!result.landing) result.landing = window.location.href.slice(0, 300);
    origin.current = result;
    try { sessionStorage.setItem("dlp_origem", JSON.stringify(result)); } catch { /* Session-only in-memory fallback. */ }
  }, []);
  return useCallback(() => origin.current, []);
}
