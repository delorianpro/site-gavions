import type { RefObject } from "react";
import type { SubmissionState } from "@/lib/leads/types";
import { Icon } from "@/components/icons/Icon";
import styles from "./LeadForm.module.css";

type Props = { state: SubmissionState; elementRef: RefObject<HTMLDivElement | null> };
export function LeadFeedback({ state, elementRef }: Props) {
  if (state.kind !== "confirmed") return null;
  return (
    <div ref={elementRef} className={styles.thanks} data-thanks="" tabIndex={-1} role="status" aria-live="polite">
      <span className={styles.thanksIc} aria-hidden="true"><Icon name="check" /></span>
      <h3>Solicitação enviada com sucesso!</h3>
      <p data-thanks-text="">Recebemos suas informações. Em breve, nossa equipe entrará em contato pelo WhatsApp para agendar sua demonstração da Gavions.</p>
    </div>
  );
}
