import { encodeForm } from "./formatting";
import type { FailureReason, LeadConfig, LeadPayload, TransportResult } from "./types";

/** Only POSTs a payload. Never opens external applications or reports analytics. */
export async function sendLead(lead: LeadPayload, config: LeadConfig, signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<TransportResult> {
  const controller = new AbortController();
  let timedOut = false;
  let reason: FailureReason = "network";
  let status: number | undefined;
  const abort = () => controller.abort();
  if (signal?.aborted) return { kind: "failed", reason: "aborted" };
  signal?.addEventListener("abort", abort, { once: true });
  const duration = Number.isFinite(config.requestTimeoutMs) && config.requestTimeoutMs > 0 ? config.requestTimeoutMs : 10000;
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
      const json = config.leadEndpointFormat !== "form";
      const response = await fetcher(config.leadEndpoint.trim(), {
        method: "POST", signal: controller.signal,
        headers: json ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
        body: json ? JSON.stringify(lead) : encodeForm(lead),
      });
      status = response.status;
      if (!response.ok) { reason = "http"; throw new Error("http"); }
      if (config.responseContract.kind === "json") {
        reason = "response";
        const body: unknown = await response.json();
        const contract = config.responseContract;
        if (!body || typeof body !== "object" || Array.isArray(body) || (body as Record<string, unknown>)[contract.field] !== contract.value) throw new Error("response");
      }
    });
    await Promise.race([request, aborted]);
    return { kind: "confirmed" };
  } catch {
    return { kind: "failed", reason: timedOut ? "timeout" : signal?.aborted ? "aborted" : reason, ...(status === undefined ? {} : { status }) };
  } finally {
    clearTimeout(timer); removeAbort(); signal?.removeEventListener("abort", abort);
  }
}
