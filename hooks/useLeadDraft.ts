"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyFields, stepNames, type LeadDraft } from "@/lib/leads/types";
import { restoreDraft } from "@/lib/leads/validation";

const initial: LeadDraft = { fields: emptyFields, step: 0 };
export function useLeadDraft() {
  const [navigation, setNavigation] = useState({ draft: initial, furthestStep: 0 });
  const draft = navigation.draft;
  const [ready, setReady] = useState(false);
  const current = useRef({ draft: initial, furthestStep: 0, ready: false, finished: false, key: "" });
  const persist = useCallback(() => {
    const state = current.current;
    if (!state.ready || state.finished) return;
    try { sessionStorage.setItem(state.key, JSON.stringify({ step: stepNames[state.draft.step], fields: state.draft.fields, furthestStep: state.furthestStep })); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    let active = true;
    current.current.key = "dlp_lead_draft_v1:" + window.location.pathname;
    queueMicrotask(() => {
      if (!active) return;
      let restored = current.current.draft;
      let furthestStep = current.current.furthestStep;
      try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(current.current.key) || "null");
        restored = restoreDraft(saved);
        if (saved && typeof saved === "object" && "furthestStep" in saved && typeof saved.furthestStep === "number" && Number.isInteger(saved.furthestStep) && saved.furthestStep >= 0 && saved.furthestStep < stepNames.length) furthestStep = saved.furthestStep;
      } catch { /* Use empty fields. */ }
      furthestStep = Math.max(furthestStep, restored.step);
      current.current.draft = restored; current.current.furthestStep = furthestStep; current.current.ready = true;
      setNavigation({ draft: restored, furthestStep }); setReady(true); persist();
    });
    window.addEventListener("pagehide", persist);
    return () => { active = false; window.removeEventListener("pagehide", persist); persist(); };
  }, [persist]);
  const update = useCallback((next: LeadDraft) => {
    const state = current.current;
    // Earlier steps have already been completed and stay manual when revisited.
    state.furthestStep = Math.max(state.furthestStep, state.draft.step, next.step);
    state.draft = next; setNavigation({ draft: next, furthestStep: state.furthestStep }); persist();
  }, [persist]);
  const getCurrent = useCallback(() => current.current.draft, []);
  const clear = useCallback(() => {
    current.current.finished = true;
    try { sessionStorage.removeItem(current.current.key); } catch { /* Storage may be blocked. */ }
  }, []);
  return { draft, ready, update, getCurrent, reviewing: draft.step < navigation.furthestStep, clear };
}
