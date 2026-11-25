import type { FailureReason, LeadConfig, LeadPayload, TransportResult } from "./types";

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new Error("aborted")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

/** Same-origin POST only; a token is issued and aged before each attempt. No automatic retries. */
export async function sendLead(lead: LeadPayload, config: LeadConfig, signal?: AbortSignal, fetcher: typeof fetch = fetch, website = ""): Promise<TransportResult> {
  const controller = new AbortController();
  let timedOut = false;
  let reason: FailureReason = "network";
  let status: number | undefined;
  const abort = () => controller.abort();
  if (signal?.aborted) return { kind: "failed", reason: "aborted" };
  signal?.addEventListener("abort", abort, { once: true });
  const duration = Number.isFinite(config.requestTimeoutMs) && config.requestTimeoutMs > 0 ? config.requestTimeoutMs : 15000;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, duration);
  let removeAbort = () => {};
  try {
    const aborted = new Promise<never>((_, reject) => {
      const fail = () => reject(new Error("aborted"));
      controller.signal.addEventListener("abort", fail, { once: true });
      removeAbort = () => controller.signal.removeEventListener("abort", fail);
    });
    const request = Promise.resolve().then(async () => {
      if (controller.signal.aborted) throw new Error("aborted");
      const tokenResponse = await fetcher("/api/leads/token", {
        method: "GET", cache: "no-store", credentials: "same-origin", signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!tokenResponse.ok) { reason = "http"; status = tokenResponse.status; throw new Error("http"); }
      reason = "response";
      const token: unknown = await tokenResponse.json();
      if (!token || typeof token !== "object" || !("token" in token) || typeof token.token !== "string"
        || !("waitMs" in token) || typeof token.waitMs !== "number" || !Number.isFinite(token.waitMs) || token.waitMs < 0 || token.waitMs > 5000) throw new Error("response");
      await wait(token.waitMs, controller.signal);
      if (controller.signal.aborted) throw new Error("aborted");
      reason = "network";
      // Metadata/administrative fields are never sent to the insert endpoint.
      const { nome, whatsapp, empresa, cidade, tipo_local, cameras, internet, email, mensagem, consentimento } = lead;
      const response = await fetcher(config.leadEndpoint, {
        method: "POST", signal: controller.signal, credentials: "same-origin", cache: "no-store", redirect: "error",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-Lead-Token": token.token },
        body: JSON.stringify({ nome, whatsapp, empresa, cidade, tipo_local, cameras, internet, email, mensagem, consentimento, website }),
      });
      status = response.status;
      if (!response.ok) { reason = "http"; throw new Error("http"); }
      reason = "response";
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || Array.isArray(body) || !("ok" in body) || body.ok !== true) throw new Error("response");
    });
    await Promise.race([request, aborted]);
    return { kind: "confirmed" };
  } catch {
    return { kind: "failed", reason: timedOut ? "timeout" : signal?.aborted ? "aborted" : reason, ...(status === undefined ? {} : { status }) };
  } finally {
    clearTimeout(timer); removeAbort(); signal?.removeEventListener("abort", abort);
  }
}
