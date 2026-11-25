"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyFields, stepNames, type LeadDraft } from "@/lib/leads/types";
import { restoreDraft } from "@/lib/leads/validation";

const initial: LeadDraft = { fields: emptyFields, step: 0 };
export function useLeadDraft() {
  const [draft, setDraft] = useState<LeadDraft>(initial);
  const [ready, setReady] = useState(false);
  const current = useRef({ draft: initial, ready: false, finished: false, key: "" });
  const persist = useCallback(() => {
    const state = current.current;
    if (!state.ready || state.finished) return;
    try { sessionStorage.setItem(state.key, JSON.stringify({ step: stepNames[state.draft.step], fields: state.draft.fields })); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    let active = true;
    current.current.key = "dlp_lead_draft_v1:" + window.location.pathname;
    queueMicrotask(() => {
      if (!active) return;
      let restored = current.current.draft;
      try { restored = restoreDraft(JSON.parse(sessionStorage.getItem(current.current.key) || "null")); } catch { /* Use empty fields. */ }
      current.current.draft = restored; current.current.ready = true;
      setDraft(restored); setReady(true); persist();
    });
    window.addEventListener("pagehide", persist);
    return () => { active = false; window.removeEventListener("pagehide", persist); persist(); };
  }, [persist]);
  const update = useCallback((next: LeadDraft) => {
    current.current.draft = next; setDraft(next); persist();
  }, [persist]);
  const getCurrent = useCallback(() => current.current.draft, []);
  const clear = useCallback(() => {
    current.current.finished = true;
    try { sessionStorage.removeItem(current.current.key); } catch { /* Storage may be blocked. */ }
  }, []);
  return { draft, ready, update, getCurrent, clear };
}
