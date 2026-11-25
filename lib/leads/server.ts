import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cameraOptions, internetOptions, locationTypes, leadErrorMessage } from "./types";
import { normalizeWhatsapp, validEmail } from "./rules";

const MAX_BODY_BYTES = 8192;
const TOKEN_WAIT_MS = 2000;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 8000;
const RESPONSE_HEADERS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
class RequestError extends Error {
  constructor(readonly status: number) { super("Lead request failed"); }
}

type Environment = { SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string };
type Dependencies = { env?: () => Environment; fetcher?: typeof fetch; now?: () => number };

function reply(status: number, body: object) {
  return Response.json(body, { status, headers: RESPONSE_HEADERS });
}
function sameOrigin(request: Request, requireOrigin: boolean) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if ((requireOrigin && !origin) || (origin && origin !== new URL(request.url).origin)
    || (site && site !== "same-origin" && site !== "none")) throw new RequestError(403);
}
function configuration(env: Environment) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) throw new RequestError(503);
  const url = new URL(env.SUPABASE_URL);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new RequestError(503);
  return { url: new URL("/rest/v1/leads", url).href, key: env.SUPABASE_SECRET_KEY };
}
function signature(value: string, origin: string, key: string) {
  return createHmac("sha256", key).update(`gavions:lead-token:v1:${origin}:${value}`).digest("hex");
}
function verifyToken(request: Request, key: string, now: number) {
  const token = request.headers.get("x-lead-token") || "";
  if (!/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) throw new RequestError(403);
  const [issued, nonce, mac] = token.split(".");
  const expected = signature(`${issued}.${nonce}`, new URL(request.url).origin, key);
  if (!timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"))) throw new RequestError(403);
  const age = now - Number(issued);
  if (age < TOKEN_WAIT_MS || age > TOKEN_TTL_MS) throw new RequestError(403);
}
async function readBody(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) throw new RequestError(413);
  if (!request.body) throw new RequestError(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_BODY_BYTES) throw new RequestError(413);
          chunks.push(value);
        }
        try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
        catch { throw new RequestError(400); }
      })(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new RequestError(408)), 5000); }),
    ]);
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
  }
}
function normalizeLead(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new RequestError(422);
  const body = input as Record<string, unknown>;
  const allowed = ["nome", "whatsapp", "empresa", "cidade", "tipo_local", "cameras", "internet", "email", "mensagem", "consentimento", "website"];
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new RequestError(422);
  function text(name: string, max: number, min = 0, multiline = false) {
    const raw = body[name];
    if (raw === undefined && min === 0) return "";
    if (typeof raw !== "string" || raw.length > max || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(raw) || (!multiline && /[\r\n]/.test(raw))) throw new RequestError(422);
    const value = raw.normalize("NFC").trim();
    if (value.length < min || value.length > max) throw new RequestError(422);
    return multiline ? value : value.replace(/\s+/g, " ");
  }
  if (text("website", 200)) throw new RequestError(403);
  if (body.consentimento !== true) throw new RequestError(422);
  const name = text("nome", 80, 2);
  const whatsapp = normalizeWhatsapp(text("whatsapp", 32, 10));
  const company = text("empresa", 80) || null;
  const city = text("cidade", 60, 2);
  const property_type = text("tipo_local", 80, 1);
  const camera_quantity = text("cameras", 40, 1);
  const internet_type = text("internet", 40, 1);
  const email = text("email", 120);
  const notes = text("mensagem", 600, 0, true) || null;
  if (!whatsapp || (email && !validEmail(email)) || !locationTypes.some(v => v === property_type)
    || !cameraOptions.some(v => v === camera_quantity) || !internetOptions.some(v => v === internet_type)) throw new RequestError(422);
  const normalizedEmail = email ? email.slice(0, email.indexOf("@") + 1) + email.slice(email.indexOf("@") + 1).toLowerCase() : null;
  return { name, whatsapp, company, city, property_type, camera_quantity, internet_type, email: normalizedEmail, notes, contact_consent: true };
}

/** Dependencies are injected only by local tests. No remote calls occur at import/build time. */
export function createLeadHandlers({ env = () => ({ SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY }), fetcher = fetch, now = Date.now }: Dependencies = {}) {
  return {
    async token(request: Request) {
      try {
        sameOrigin(request, false);
        const { key } = configuration(env());
        const value = `${now()}.${randomBytes(16).toString("hex")}`;
        return reply(200, { token: `${value}.${signature(value, new URL(request.url).origin, key)}`, waitMs: TOKEN_WAIT_MS + 100 });
      } catch (error) {
        return reply(error instanceof RequestError ? error.status : 503, { ok: false, message: leadErrorMessage });
      }
    },
    async post(request: Request) {
      try {
        sameOrigin(request, true);
        if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new RequestError(415);
        const { url, key } = configuration(env());
        verifyToken(request, key, now());
        const lead = normalizeLead(await readBody(request));
        let response: Response;
        try {
          response = await fetcher(url, {
            method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            headers: { apikey: key, "Content-Type": "application/json", "Content-Profile": "public", Prefer: "return=minimal" },
            body: JSON.stringify(lead),
          });
        } catch (error) {
          throw new RequestError(error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? 504 : 502);
        }
        // Do not parse/return database errors or representations, which can contain PII.
        void response.body?.cancel().catch(() => {});
        if (response.status !== 201 && response.status !== 204) throw new RequestError(502);
        return reply(201, { ok: true });
      } catch (error) {
        return reply(error instanceof RequestError ? error.status : 503, { ok: false, message: leadErrorMessage });
      }
    },
  };
}
