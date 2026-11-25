import type { ChangeEvent } from "react";
import type { ChoiceFieldName, LeadErrors, LeadFields, TextFieldName } from "@/lib/leads/types";
import styles from "@/components/lead-form/LeadForm.module.css";

type Props = {
  values: LeadFields; errors: LeadErrors; step: number; enabled: boolean;
  onTextChange: (name: TextFieldName, value: string, choice?: boolean, composing?: boolean) => void;
  onConsentChange: (value: boolean) => void;
};
export function LeadFormFields({ values, errors, step, enabled, onTextChange, onConsentChange }: Props) {
  function aria(name: keyof LeadFields) { return { "aria-invalid": errors[name] || undefined, "aria-describedby": errors[name] ? "e-" + name : undefined }; }
  function text(name: TextFieldName) {
    return { name: enabled ? name : undefined, value: values[name], ...aria(name), onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onTextChange(name, event.currentTarget.value, false, (event.nativeEvent as InputEvent).isComposing) };
  }
  function radio(name: ChoiceFieldName, value: string) {
    return { name: enabled ? name : undefined, value, checked: values[name] === value, ...aria(name), onChange: () => onTextChange(name, value, true) };
  }
  return (
    <>
      <section className={styles.formStep} data-form-step="contato" aria-labelledby="step-contato" hidden={step !== 0}>
        <h4 id="step-contato">Como podemos falar com você?</h4>
        <div className={styles.field}>
          <label htmlFor="f-nome">Seu nome</label>
          <input id="f-nome" {...text("nome")} type="text" autoComplete="name" required maxLength={80} />
          <p className={[styles.err, errors.nome && styles.show].filter(Boolean).join(" ")} id="e-nome">Informe seu nome.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="f-whatsapp">WhatsApp</label>
          <input id="f-whatsapp" {...text("whatsapp")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(11) 91234-5678" required maxLength={16} />
          <p className={[styles.err, errors.whatsapp && styles.show].filter(Boolean).join(" ")} id="e-whatsapp">Informe um WhatsApp com DDD.</p>
        </div>
      </section>
      <section className={styles.formStep} data-form-step="local" aria-labelledby="step-local" hidden={step !== 1}>
        <h4 id="step-local">Onde você quer proteger?</h4>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label htmlFor="f-empresa">{"Empresa "}<span className={styles.opt}>(opcional)</span></label>
            <input id="f-empresa" {...text("empresa")} type="text" autoComplete="organization" maxLength={80} />
          </div>
          <div className={styles.field}>
            <label htmlFor="f-cidade">Cidade</label>
            <input id="f-cidade" {...text("cidade")} type="text" autoComplete="address-level2" placeholder="Ex.: Campinas, SP" required maxLength={60} />
            <p className={[styles.err, errors.cidade && styles.show].filter(Boolean).join(" ")} id="e-cidade">Informe a cidade.</p>
          </div>
        </div>
        <fieldset className={styles.field}>
          <legend>Que tipo de local?</legend>
          <div className={styles.pills}>
            <label><input type="radio" {...radio("tipo", "Empresa ou escritório")} required /><span>Empresa / escritório</span></label>
            <label><input type="radio" {...radio("tipo", "Galpão ou indústria")} /><span>Galpão / indústria</span></label>
            <label><input type="radio" {...radio("tipo", "Obra")} /><span>Obra</span></label>
            <label><input type="radio" {...radio("tipo", "Comércio ou loja")} /><span>Comércio / loja</span></label>
            <label><input type="radio" {...radio("tipo", "Várias unidades")} /><span>Várias unidades</span></label>
            <label><input type="radio" {...radio("tipo", "Outro")} /><span>Outro</span></label>
          </div>
          <p className={[styles.err, errors.tipo && styles.show].filter(Boolean).join(" ")} id="e-tipo">Escolha o tipo de local.</p>
        </fieldset>
      </section>
      <section className={styles.formStep} data-form-step="estrutura" aria-labelledby="step-estrutura" hidden={step !== 2}>
        <h4 id="step-estrutura">O que você já tem no local?</h4>
        <fieldset className={styles.field}>
          <legend>Quantas câmeras?</legend>
          <div className={styles.pills}>
            <label><input type="radio" {...radio("cameras", "Ainda não tenho")} /><span>Ainda não tenho</span></label>
            <label><input type="radio" {...radio("cameras", "1 a 4")} /><span>1 a 4</span></label>
            <label><input type="radio" {...radio("cameras", "5 a 8")} /><span>5 a 8</span></label>
            <label><input type="radio" {...radio("cameras", "9 a 16")} /><span>9 a 16</span></label>
            <label><input type="radio" {...radio("cameras", "Mais de 16")} /><span>Mais de 16</span></label>
          </div>
        </fieldset>
        <fieldset className={styles.field}>
          <legend>Internet no local</legend>
          <div className={styles.pills}>
            <label><input type="radio" {...radio("internet", "Fixa (banda larga)")} /><span>Fixa</span></label>
            <label><input type="radio" {...radio("internet", "Só 4G")} /><span>Só 4G</span></label>
            <label><input type="radio" {...radio("internet", "Não tem ainda")} /><span>Não tem ainda</span></label>
            <label><input type="radio" {...radio("internet", "Não sei")} /><span>Não sei</span></label>
          </div>
        </fieldset>
      </section>
      <section className={styles.formStep} data-form-step="detalhes" aria-labelledby="step-detalhes" hidden={step !== 3}>
        <h4 id="step-detalhes">Quer acrescentar algum detalhe?</h4>
        <div className={styles.field}>
          <label htmlFor="f-email">{"E-mail "}<span className={styles.opt}>(opcional)</span></label>
          <input id="f-email" {...text("email")} type="email" autoComplete="email" maxLength={120} />
          <p className={[styles.err, errors.email && styles.show].filter(Boolean).join(" ")} id="e-email">Confira o e-mail.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="f-msg">{"Algo que devemos saber? "}<span className={styles.opt}>(opcional)</span></label>
          <textarea id="f-msg" {...text("mensagem")} rows={3} maxLength={600} placeholder="Ex.: já tivemos furto no pátio; queremos sirene no portão."></textarea>
        </div>
      </section>
      <section className={styles.formStep} data-form-step="confirmacao" aria-labelledby="step-confirmacao" hidden={step !== 4}>
        <h4 id="step-confirmacao">Tudo pronto para agendar</h4>
        <p className={styles.stepHint}>Autorize o contato para enviar seu pedido. Você pode voltar e revisar suas respostas.</p>
        <label className={styles.consent}><input type="checkbox" name={enabled ? "consentimento" : undefined} checked={values.consentimento} onChange={event => onConsentChange(event.currentTarget.checked)} {...aria("consentimento")} required /><span>Autorizo a Gavions a entrar em contato sobre este pedido. Usamos seus dados apenas para responder a ele.</span></label>
        <p className={[styles.err, styles.consentError, errors.consentimento && styles.show].filter(Boolean).join(" ")} id="e-consentimento">É preciso autorizar o contato.</p>
      </section>
    </>
  );
}
