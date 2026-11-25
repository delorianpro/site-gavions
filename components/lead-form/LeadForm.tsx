"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLeadDraft } from "@/hooks/useLeadDraft";
import { useLeadAttribution } from "@/hooks/useLeadAttribution";
import { track } from "@/lib/analytics";
import { collectLead, createHandoff, formatPhone, hasDestination } from "@/lib/leads/formatting";
import { maxLengths, stepComplete, stepFields, validate } from "@/lib/leads/validation";
import { sendLead } from "@/lib/leads/transport";
import { locationTypes, type FieldName, type LeadConfig, type LeadErrors, type SubmissionState, type TextFieldName } from "@/lib/leads/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { LeadFormFields } from "./LeadFormFields";
import { LeadFeedback } from "./LeadFeedback";
import styles from "./LeadForm.module.css";

const errorMessages = {
  http: "Não foi possível registrar o pedido. Tente novamente ou use a alternativa abaixo.",
  network: "Não foi possível enviar agora. Confira sua conexão e tente novamente.",
  response: "O serviço não confirmou o recebimento. Tente novamente ou use a alternativa abaixo.",
  timeout: "O envio excedeu o tempo limite. Suas respostas foram mantidas; tente novamente.",
  aborted: "Envio cancelado. Suas respostas foram mantidas.",
};

export function LeadForm({ config }: { config: LeadConfig }) {
  const { draft, ready, update, getCurrent, clear } = useLeadDraft();
  const getOrigin = useLeadAttribution();
  const [errors, setErrors] = useState<LeadErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ kind: "idle" });
  const [website, setWebsite] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const focusRequest = useRef<{ field?: FieldName } | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);
  const version = useRef(0);
  const composing = useRef(false);
  const busy = useRef(false);
  const mounted = useRef(false);
  const requestId = useRef({ value: 0 });
  const controller = useRef<AbortController | null>(null);
  const interrupted = useRef(false);
  const terminal = submission.kind === "confirmed" || submission.kind === "handoff";
  const sending = submission.kind === "sending";

  const cancelAdvance = useCallback(() => {
    version.current++;
    if (advance.current !== null) clearTimeout(advance.current);
    advance.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const requests = requestId.current;
    queueMicrotask(() => {
      if (mounted.current && interrupted.current) {
        interrupted.current = false;
        setSubmission({ kind: "failed", reason: "aborted", alternative: null });
      }
    });
    const leave = () => { cancelAdvance(); controller.current?.abort(); };
    document.addEventListener("visibilitychange", cancelAdvance);
    window.addEventListener("blur", cancelAdvance);
    window.addEventListener("pagehide", leave);
    return () => {
      mounted.current = false;
      cancelAdvance();
      if (controller.current) { interrupted.current = true; controller.current.abort(); controller.current = null; }
      requests.value++; busy.current = false;
      document.removeEventListener("visibilitychange", cancelAdvance);
      window.removeEventListener("blur", cancelAdvance);
      window.removeEventListener("pagehide", leave);
    };
  }, [cancelAdvance]);

  useLayoutEffect(() => {
    if (terminal) { feedback.current?.focus(); return; }
    if (!focusRequest.current) return;
    const name = focusRequest.current.field;
    focusRequest.current = null;
    const section = form.current?.querySelector<HTMLElement>(`[data-form-step]:not([hidden])`);
    const input = name ? form.current?.querySelector<HTMLInputElement>(`[name="${name}"]`) : section?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input:checked, input:not([type="radio"]), textarea, input');
    input?.focus({ preventScroll: true });
    section?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [draft.step, errors, terminal]);

  function goTo(step: number, field?: FieldName) {
    cancelAdvance();
    if (!busy.current) setSubmission({ kind: "idle" });
    focusRequest.current = { field };
    update({ ...getCurrent(), step: Math.max(0, Math.min(4, step)) });
  }
  function valid(step?: number) {
    const current = getCurrent();
    const nextErrors = validate(current.fields, step);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0] as FieldName | undefined;
    if (first) { goTo(stepFields.findIndex(names => names.includes(first)), first); return false; }
    return true;
  }
  function next() {
    cancelAdvance();
    if (!ready || busy.current) return;
    const { step } = getCurrent();
    if (step < 4 && valid(step)) goTo(step + 1);
  }
  function schedule(choice: boolean, isComposing = false) {
    cancelAdvance();
    const current = getCurrent();
    if (busy.current || composing.current || isComposing || document.hidden || !stepComplete(current.fields, current.step)) return;
    const token = version.current;
    advance.current = setTimeout(() => {
      const latest = getCurrent();
      if (version.current === token && !busy.current && !composing.current && !document.hidden && current.step === latest.step && stepComplete(latest.fields, latest.step)) next();
    }, choice ? 450 : 1400);
  }
  function changeText(name: TextFieldName, value: string, choice = false, isComposing = false) {
    cancelAdvance();
    const current = getCurrent();
    const normalized = name === "whatsapp" ? formatPhone(value) : value.slice(0, maxLengths[name]);
    update({ ...current, fields: { ...current.fields, [name]: normalized } });
    setErrors(previous => ({ ...previous, [name]: false }));
    schedule(choice, isComposing);
  }
  function changeConsent(value: boolean) {
    cancelAdvance();
    const current = getCurrent();
    update({ ...current, fields: { ...current.fields, consentimento: value } });
    setErrors(previous => ({ ...previous, consentimento: false }));
  }
  function handoff(fallback: boolean) {
    cancelAdvance();
    if (!valid()) return false;
    const lead = collectLead(getCurrent().fields, getOrigin(), window.location.href);
    const destination = createHandoff(lead, config);
    if (!destination) return false;
    // Open synchronously from the user's action. This is not proof of delivery.
    try { window.open(destination.url, "_blank", "noopener,noreferrer"); } catch { /* The feedback retains an explicit retry link. */ }
    if (fallback) track("lead_fallback", { method: destination.method });
    busy.current = true;
    setSubmission({ kind: "handoff", handoff: destination });
    return true;
  }
  async function submit() {
    cancelAdvance();
    if (!ready || busy.current) return;
    if (getCurrent().step < 4) { next(); return; }
    if (website) { setWebsite(""); setSubmission({ kind: "blocked" }); return; }
    if (!valid()) { setSubmission({ kind: "invalid" }); return; }
    if (!hasDestination(config)) { setSubmission({ kind: "unconfigured" }); return; }
    busy.current = true;
    if (!config.leadEndpoint.trim()) {
      if (!handoff(false)) busy.current = false;
      return;
    }
    const lead = collectLead(getCurrent().fields, getOrigin(), window.location.href);
    const id = ++requestId.current.value;
    const abort = new AbortController(); controller.current = abort;
    setSubmission({ kind: "sending" });
    const result = await sendLead(lead, config, abort.signal);
    if (!mounted.current || id !== requestId.current.value) return;
    controller.current = null;
    if (result.kind === "confirmed") {
      clear();
      const tipo = locationTypes.find(value => value === lead.tipo_local);
      track("generate_lead", { method: "endpoint", ...(tipo ? { tipo_local: tipo } : {}) });
      setSubmission({ kind: "confirmed", lead, handoff: config.whatsappNumber.replace(/\D/g, "") ? createHandoff(lead, config) : null });
    } else {
      busy.current = false;
      setSubmission({ kind: "failed", reason: result.reason, alternative: result.reason === "aborted" ? null : createHandoff(lead, config) });
    }
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void submit(); }
  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && !composing.current && !event.nativeEvent.isComposing && event.target instanceof HTMLInputElement && getCurrent().step < 4) {
      event.preventDefault(); next();
    }
  }
  const message = submission.kind === "sending" ? "Enviando…" : submission.kind === "failed" ? errorMessages[submission.reason] : submission.kind === "unconfigured" ? "Destino dos pedidos ainda não configurado. Nada foi enviado." : submission.kind === "invalid" ? "Confira os campos destacados." : submission.kind === "blocked" ? "Não foi possível enviar este pedido. Revise suas respostas e tente novamente." : "";

  return (
    <>
      <form ref={form} id="lead-form" method="post" action="#demonstracao" noValidate data-lead-form="" hidden={terminal}
        onSubmit={onSubmit} onKeyDown={onKeyDown} onPointerDownCapture={cancelAdvance}
        onCompositionStart={() => { composing.current = true; cancelAdvance(); }}
        onCompositionEnd={() => { composing.current = false; schedule(false); }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) cancelAdvance(); }}>
        <h3>Agende sua demonstração</h3>
        <p className={styles.formHint}>Leva menos de um minuto.</p>
        <div className={styles.cfgWarning} data-cfg-warning="" hidden={hasDestination(config)}>
          <b>Configuração pendente:</b> defina o destino dos pedidos antes de publicar. Sem isso, nenhum pedido é enviado.
        </div>
        <div className={styles.formProgress} data-form-progress="">
          <p role="status" aria-live="polite" data-step-status="">Etapa {draft.step + 1} de 5</p>
          <progress max={5} value={draft.step + 1} aria-label="Progresso do formulário" data-step-progress="" />
        </div>
        <fieldset className={styles.controls} disabled={!ready || sending}>
          <LeadFormFields values={draft.fields} errors={errors} step={draft.step} enabled={ready} onTextChange={changeText} onConsentChange={changeConsent} />
          <div className={styles.hp} aria-hidden="true"><label>Não preencha<input type="text" name={ready ? "website" : undefined} value={website} onChange={event => setWebsite(event.currentTarget.value)} tabIndex={-1} autoComplete="off" /></label></div>
          <div className={styles.formActions}>
            <Button as="button" variant="ghost" type="button" data-step-back="" hidden={draft.step === 0} onClick={() => { if (!busy.current) { setErrors({}); goTo(getCurrent().step - 1); } }}>Voltar</Button>
            <Button as="button" variant="primary" type="button" data-step-next="" hidden={draft.step === 4} onClick={next}>{"Continuar "}<Icon name="arrow" /></Button>
            <Button as="button" variant="primary" size="large" fullWidth type="button" data-submit="" hidden={draft.step !== 4} onClick={() => void submit()}>{"Quero minha demonstração "}<Icon name="arrow" /></Button>
          </div>
        </fieldset>
        {sending && <Button as="button" variant="ghost" type="button" onClick={() => controller.current?.abort()}>Cancelar envio</Button>}
        <p className={[styles.formStatus, submission.kind !== "idle" && !sending && styles.bad].filter(Boolean).join(" ")} role="status" aria-live="polite" data-status="">{message}</p>
        {submission.kind === "failed" && submission.alternative && <Button as="button" variant={submission.alternative.method === "whatsapp" ? "whatsapp" : "ghost"} fullWidth type="button" onClick={() => { if (!busy.current) handoff(true); }}>Enviar pelo {submission.alternative.method === "whatsapp" ? "WhatsApp" : "e-mail"}</Button>}
        <noscript><p className={styles.formStatus}>Ative o JavaScript para preencher e enviar o pedido com segurança.</p></noscript>
      </form>
      <LeadFeedback state={submission} elementRef={feedback} onReturn={() => { busy.current = false; setSubmission({ kind: "idle" }); goTo(getCurrent().step); }} />
    </>
  );
}
