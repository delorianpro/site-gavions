import type { RefObject } from "react";
import type { SubmissionState } from "@/lib/leads/types";
import { formatPhone } from "@/lib/leads/formatting";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import styles from "./LeadForm.module.css";

type Props = { state: SubmissionState; elementRef: RefObject<HTMLDivElement | null>; onReturn: () => void };
export function LeadFeedback({ state, elementRef, onReturn }: Props) {
  if (state.kind !== "confirmed" && state.kind !== "handoff") return null;
  const confirmed = state.kind === "confirmed";
  const handoff = state.handoff;
  return (
    <div ref={elementRef} className={styles.thanks} data-thanks="" tabIndex={-1}>
      <span className={styles.thanksIc}><Icon name={confirmed ? "check" : "arrow"} /></span>
      <h3>{confirmed ? "Pedido recebido!" : `Envio pelo ${handoff?.method === "whatsapp" ? "WhatsApp" : "e-mail"}`}</h3>
      <p data-thanks-text="">{state.kind === "confirmed"
        ? `Recebemos seu pedido, ${state.lead.nome.split(/\s+/)[0]}. Vamos falar com você pelo WhatsApp ${formatPhone(state.lead.whatsapp)}. Se preferir, adiante a conversa agora.`
        : "Seu pedido foi preparado no aplicativo. O recebimento ainda não foi confirmado: envie a mensagem para concluir. Se ele não abriu, use o botão abaixo. Suas respostas foram mantidas."}</p>
      {handoff && <Button as="a" variant={handoff.method === "whatsapp" ? "whatsapp" : "ghost"} fullWidth href={handoff.url} target="_blank" rel="noopener noreferrer" data-thanks-wa="">{handoff.method === "whatsapp" ? "Falar agora no WhatsApp" : "Abrir e-mail com o pedido"}</Button>}
      {!confirmed && <Button as="button" variant="ghost" fullWidth type="button" onClick={onReturn}>Voltar ao formulário</Button>}
      <Button as="a" variant="ghost" fullWidth href="#app">Ver o app por dentro</Button>
    </div>
  );
}
