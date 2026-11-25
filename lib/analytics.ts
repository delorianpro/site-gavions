import { locationTypes, type LocationType } from "./leads/types";
export const ctaIds = ["cta_header", "cta_hero", "cta_hero_app", "cta_sticky", "whatsapp_float"] as const;
export type CtaId = typeof ctaIds[number];
export type AppTabId = "t-inicio" | "t-cameras" | "t-alertas" | "t-protecao" | "t-imoveis";
type EventMap = {
  cta_click: { cta: CtaId };
  app_tab: { tab: AppTabId };
  sim_replay: Record<string, never>;
  generate_lead: { method: "endpoint"; tipo_local?: LocationType };
  lead_fallback: { method: "whatsapp" | "email" };
};
export type AnalyticsCollectors = { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void };
declare global {
  interface Window {
    dataLayer?: AnalyticsCollectors["dataLayer"];
    gtag?: AnalyticsCollectors["gtag"];
    fbq?: AnalyticsCollectors["fbq"];
  }
}
/** Runtime allowlists protect collectors even when JavaScript callers bypass TypeScript. */
export function track<K extends keyof EventMap>(name: K, data: EventMap[K], collectors?: AnalyticsCollectors) {
  const raw = data as Record<string, unknown>;
  let payload: Record<string, unknown> = {};
  if (name === "cta_click") { if (!ctaIds.some(v => v === raw.cta)) return; payload = { cta: raw.cta }; }
  else if (name === "app_tab") { if (!["t-inicio", "t-cameras", "t-alertas", "t-protecao", "t-imoveis"].includes(String(raw.tab))) return; payload = { tab: raw.tab }; }
  else if (name === "generate_lead") { if (raw.method !== "endpoint") return; payload = { method: "endpoint", ...(locationTypes.some(v => v === raw.tipo_local) ? { tipo_local: raw.tipo_local } : {}) }; }
  else if (name === "lead_fallback") { if (raw.method !== "whatsapp" && raw.method !== "email") return; payload = { method: raw.method }; }
  else if (name !== "sim_replay") return;
  const target = collectors ?? (typeof window === "undefined" ? {} : window);
  try { if (Array.isArray(target.dataLayer)) target.dataLayer.push({ event: name, ...payload }); } catch { /* Analytics cannot affect the UI. */ }
  try { target.gtag?.("event", name, payload); } catch { /* Isolated collector failure. */ }
  try { if (name === "generate_lead") target.fbq?.("track", "Lead"); else target.fbq?.("trackCustom", name, payload); } catch { /* Isolated collector failure. */ }
}
