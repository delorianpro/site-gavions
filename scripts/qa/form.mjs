import { openHarness, sleep, waitUntil } from './browser.mjs';
import { writeFile } from 'node:fs/promises';
import { outputDir, fakeLeadConfig } from './config.mjs';
const h = await openHarness(outputDir('form'));
const results = [];
let failed;
const fields = { nome: 'Pessoa Teste', whatsapp: '(11) 90000-0000', email: '', empresa: '', cidade: 'Cidade Teste', tipo: 'Obra', cameras: '1 a 4', internet: 'Não sei', mensagem: '', consentimento: true };
const base = { ...fakeLeadConfig };
const endpoint = { ...base, leadEndpoint: h.nextOrigin + '/__lead-mock' };
const seed = (step = 'confirmacao', extra = {}) => `sessionStorage.setItem('dlp_lead_draft_v1:/',JSON.stringify(${JSON.stringify({ step, fields: { ...fields, ...extra } })}));`;
const spy = `window.__opens=[];window.open=(url,...args)=>{window.__opens.push({url,args});return null};window.dataLayer=[];window.__gt=[];window.__fb=[];window.gtag=(...args)=>window.__gt.push(args);window.fbq=(...args)=>window.__fb.push(args);`;
const evaluate = (s, c) => h.evaluate(s, c);
function check(name, condition) { results.push({ name, pass: !!condition }); console.log(JSON.stringify(results.at(-1))); if (!condition)
    throw Error(name); }
async function page(label, opts = {}) { const s = await h.createPage(label, opts); if (!opts.jsDisabled && !opts.blockScripts) {
    for (let i = 0; i < 70; i++) {
        if (await evaluate(s, `!document.querySelector("#f-nome").matches(":disabled")`))
            break;
        await sleep(100);
    }
} await evaluate(s, spy); return s; }
async function set(s, selector, value, { compose = false } = {}) { return evaluate(s, `(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.focus();Object.getOwnPropertyDescriptor(e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:${compose}}));return true})()`); }
async function click(s, sel) { await evaluate(s, `(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e.getClientRects().length)throw Error('Controle não visível: '+${JSON.stringify(sel)});e.click()})()`); await sleep(40); }
async function step(s) { return evaluate(s, `document.querySelector('[data-form-step]:not([hidden])').dataset.formStep`); }
async function key(s, key) {
    const keys = { Enter: { code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' }, Tab: { code: 'Tab', windowsVirtualKeyCode: 9 }, ' ': { code: 'Space', windowsVirtualKeyCode: 32, text: ' ' } };
    await h.send('Input.dispatchKeyEvent', { type: 'keyDown', key, ...keys[key] }, s);
    await h.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: keys[key]?.code, windowsVirtualKeyCode: keys[key]?.windowsVirtualKeyCode }, s);
    await sleep(50);
}
async function autofill(s, selector) {
    await evaluate(s, `document.querySelector(${JSON.stringify(selector)}).focus()`);
    await h.send('Autofill.enable', {}, s);
    await h.send('DOM.enable', {}, s);
    const { root } = await h.send('DOM.getDocument', {}, s);
    const { nodeId } = await h.send('DOM.querySelector', { nodeId: root.nodeId, selector }, s);
    const { node } = await h.send('DOM.describeNode', { nodeId }, s);
    const { frameTree } = await h.send('Page.getFrameTree', {}, s);
    await h.send('Autofill.trigger', { fieldId: node.backendNodeId, frameId: frameTree.frame.id, address: { fields: [
        { name: 'NAME_FULL', value: 'Pessoa Teste' }, { name: 'PHONE_HOME_WHOLE_NUMBER', value: '+5511900000000' },
        { name: 'ADDRESS_HOME_CITY', value: 'Cidade Teste' }, { name: 'COMPANY_NAME', value: 'Empresa Teste' },
        { name: 'EMAIL_ADDRESS', value: 'qa@example.invalid' },
    ] } }, s);
}
async function choose(s, selector, touch) {
    if (!touch) return click(s, selector);
    const point = await evaluate(s, `(()=>{const e=document.querySelector(${JSON.stringify(selector)}).nextElementSibling;e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await h.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }, s);
    await h.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, s);
}
const status = s => evaluate(s, `document.querySelector('[data-status]').textContent`);
const persisted = s => evaluate(s, `Boolean(sessionStorage.getItem('dlp_lead_draft_v1:/'))`);
const submit = s => click(s, '[data-submit]');
try {
    const s = await page('navigation');
    await evaluate(s, `document.querySelector('#f-nome').focus()`);
    await key(s, 'Enter');
    check('nome e telefone vazios: erros, ARIA e foco', await evaluate(s, `document.activeElement.id==='f-nome'&&document.querySelector('#f-nome').getAttribute('aria-invalid')==='true'&&document.querySelector('#f-whatsapp').getAttribute('aria-describedby')==='e-whatsapp'`));
    await set(s, '#f-nome', 'P');
    await set(s, '#f-whatsapp', '123');
    await key(s, 'Enter');
    check('nome curto e telefone inválido impedem avanço', await step(s) === 'contato');
    await set(s, '#f-nome', 'Pessoa Teste');
    await set(s, '#f-whatsapp', '+55 11 90000-0000');
    check('máscara aplicada na interface', await evaluate(s, `document.querySelector('#f-whatsapp').value==='(11) 90000-0000'`));
    await key(s, 'Enter');
    check('Enter avança contato e foca Empresa', await step(s) === 'local' && await evaluate(s, `document.activeElement.id==='f-empresa'`));
    await sleep(1500);
    check('timer anterior cancelado ao avançar manualmente', await step(s) === 'local');
    await key(s, 'Enter');
    check('cidade e tipo obrigatórios com foco correto', await step(s) === 'local' && await evaluate(s, `document.activeElement.id==='f-cidade'&&document.querySelector('input[name="tipo"]').getAttribute('aria-invalid')==='true'`));
    await set(s, '#f-cidade', 'Cidade Teste');
    await click(s, 'input[name="tipo"][value="Obra"]');
    await key(s, 'Enter');
    check('Empresa opcional e navegação para estrutura', await step(s) === 'estrutura');
    await key(s, 'Enter');
    check('câmeras e internet obrigatórias com erros ARIA', await step(s) === 'estrutura' && await evaluate(s, `document.activeElement.name==='cameras'&&document.activeElement.getAttribute('aria-invalid')==='true'`));
    await click(s, 'input[name="cameras"][value="1 a 4"]');
    await click(s, 'input[name="internet"][value="Não sei"]');
    await key(s, 'Enter');
    check('estrutura preenchida avança para detalhes', await step(s) === 'detalhes');
    await set(s, '#f-email', 'incorreto');
    await click(s, '[data-step-next]');
    check('e-mail inválido impede avanço e recebe foco', await step(s) === 'detalhes' && await evaluate(s, `document.activeElement.id==='f-email'&&document.querySelector('#f-email').getAttribute('aria-invalid')==='true'`));
    await set(s, '#f-email', '');
    await click(s, '[data-step-next]');
    check('e-mail e mensagem opcionais vazios aceitos', await step(s) === 'confirmacao');
    await submit(s);
    check('consentimento ausente bloqueia e recebe foco', await evaluate(s, `document.activeElement.name==='consentimento'&&document.activeElement.getAttribute('aria-invalid')==='true'&&window.__opens.length===0&&document.querySelector('[data-status]').textContent==='Confira os campos destacados.'`));
    await click(s, 'input[name="consentimento"]');
    await sleep(1500);
    check('confirmação nunca envia automaticamente', await evaluate(s, `window.__opens.length===0&&!document.querySelector('[data-lead-form]').hidden`));
    await click(s, '[data-step-back]');
    check('Voltar preserva valores e foco', await step(s) === 'detalhes' && await evaluate(s, `document.activeElement.id==='f-email'`));
    await h.send('Page.reload', {}, s);
    await sleep(1100);
    check('recarregamento restaura etapa e dados originais', await step(s) === 'detalhes' && await evaluate(s, `document.querySelector('#f-nome').value==='Pessoa Teste'&&document.querySelector('input[name="consentimento"]').checked`));
    const a = await page('auto');
    await evaluate(a, `document.querySelector('[data-lead-form]').addEventListener('input',()=>window.__contactInputAt=performance.now(),true);const observer=new MutationObserver(()=>{if(document.querySelector('[data-form-step="contato"]').hidden){window.__contactDelay=performance.now()-window.__contactInputAt;observer.disconnect()}});observer.observe(document.querySelector('[data-form-step="contato"]'),{attributes:true,attributeFilter:['hidden']})`);
    await set(a, '#f-nome', 'Pessoa Teste');
    await set(a, '#f-whatsapp', '11900000000');
    await sleep(150);
    check('contato não avança antes da pausa de digitação', await step(a) === 'contato');
    await waitUntil(async () => await step(a) === 'local', 'avanço breve do contato');
    const contactDelay = await evaluate(a, `window.__contactDelay`);
    check('contato avança após debounce de 250 ms', contactDelay >= 240 && contactDelay < 350);
    console.log(JSON.stringify({ contactTransitionMs: contactDelay }));
    await set(a, '#f-cidade', 'Cidade Teste');
    await click(a, 'input[name="tipo"][value="Obra"]');
    await sleep(250);
    check('rádio aguarda 450 ms', await step(a) === 'local');
    await sleep(230);
    check('rádio avança após 450 ms', await step(a) === 'estrutura');
    await click(a, 'input[name="cameras"][value="1 a 4"]');
    await sleep(500);
    check('estrutura incompleta não avança automaticamente', await step(a) === 'estrutura');
    await click(a, 'input[name="internet"][value="Não sei"]');
    await sleep(500);
    check('estrutura completa avança automaticamente', await step(a) === 'detalhes');
    await set(a, '#f-email', 'qa@example.invalid');
    await sleep(1450);
    check('detalhes incompletos não avançam automaticamente', await step(a) === 'detalhes');
    await set(a, '#f-msg', 'Mensagem sintética');
    await sleep(1500);
    check('detalhes completos permanecem para revisão', await step(a) === 'detalhes');
    await evaluate(a, `document.querySelector('#f-email').focus()`);
    await key(a, 'Enter');
    check('Enter no e-mail não avança a etapa 4', await step(a) === 'detalhes');
    await evaluate(a, `document.querySelector('[data-lead-form]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
    check('submit implícito não avança a etapa 4', await step(a) === 'detalhes');
    const longMessage = 'Observações detalhadas sobre o local. '.repeat(15);
    await set(a, '#f-msg', longMessage);
    await sleep(1600);
    await evaluate(a, `document.querySelector('#f-msg').setSelectionRange(0,0)`);
    await h.send('Input.insertText', { text: 'Revisado: ' }, a);
    await key(a, 'Enter');
    await sleep(1600);
    check('observações longas aceitam edição e quebra de linha sem avanço', await step(a) === 'detalhes' && await evaluate(a, `document.querySelector('#f-msg').value===${JSON.stringify('Revisado: \n' + longMessage)}`));
    await evaluate(a, `document.querySelector('#f-msg').dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));document.querySelector('#f-msg').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))`);
    await sleep(1500);
    check('fim de composição não avança a etapa 4', await step(a) === 'detalhes');
    await autofill(a, '#f-email');
    await sleep(1500);
    check('autofill nativo não avança a etapa 4', await step(a) === 'detalhes');
    await evaluate(a, `document.querySelector('#f-msg').focus()`);
    await key(a, 'Tab');
    check('Tab das observações alcança Voltar', await evaluate(a, `document.activeElement.hasAttribute('data-step-back')`));
    await key(a, 'Tab');
    check('Tab alcança Continuar na etapa 4', await evaluate(a, `document.activeElement.hasAttribute('data-step-next')`));
    await key(a, 'Enter');
    check('ativação de Continuar pelo teclado avança à confirmação', await step(a) === 'confirmacao');
    await click(a, '[data-step-back]');
    await sleep(1500);
    check('retorno da confirmação preserva observações longas', await step(a) === 'detalhes' && await evaluate(a, `document.querySelector('#f-msg').value===${JSON.stringify('Revisado: \n' + longMessage)}`));
    for (const width of [320, 390, 768, 1440]) {
        const touch = width < 560;
        const p = await page('navigation-' + width, { width, height: 900 });
        if (touch) {
            await h.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: true }, p);
            await h.send('Emulation.setTouchEmulationEnabled', { enabled: true }, p);
        }
        check(`${width}: primeira etapa sem botões ou espaço de ações`, await evaluate(p, `document.querySelector('[data-step-next]').hidden&&document.querySelector('[data-step-back]').hidden&&document.querySelector('[data-step-next]').parentElement.getClientRects().length===0`));
        await autofill(p, '#f-nome');
        await waitUntil(async () => await step(p) === 'local', 'contato por autofill ' + width);
        check(`${width}: autofill nativo avança contato e preserva máscara`, await evaluate(p, `document.querySelector('#f-nome').value==='Pessoa Teste'&&document.querySelector('#f-whatsapp').value==='(11) 90000-0000'`));
        check(`${width}: etapa 2 mostra apenas Voltar`, await evaluate(p, `document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-back]').hidden`));
        await autofill(p, '#f-cidade');
        await sleep(1500);
        check(`${width}: autofill não ignora tipo obrigatório`, await step(p) === 'local');
        await choose(p, 'input[name="tipo"][value="Obra"]', touch);
        await waitUntil(async () => await step(p) === 'estrutura', 'local após autofill ' + width);
        check(`${width}: etapa 3 mostra apenas Voltar`, await evaluate(p, `document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-back]').hidden`));
        await choose(p, 'input[name="cameras"][value="1 a 4"]', touch);
        await sleep(550);
        check(`${width}: estrutura incompleta não avança`, await step(p) === 'estrutura');
        await choose(p, 'input[name="internet"][value="Não sei"]', touch);
        await waitUntil(async () => await step(p) === 'detalhes', 'estrutura completa ' + width);
        check(`${width}: etapa 4 mantém Voltar e Continuar`, await evaluate(p, `!document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-back]').hidden`));
        await set(p, '#f-email', 'qa@example.invalid');
        await set(p, '#f-msg', longMessage);
        await sleep(1550);
        check(`${width}: detalhes completos não avançam e cabem no viewport`, await step(p) === 'detalhes' && await evaluate(p, `(()=>{const r=document.querySelector('[data-lead-form]').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()`));
        await click(p, '[data-step-back]'); await sleep(1550);
        check(`${width}: revisar estrutura permite Continuar sem edição`, await step(p) === 'estrutura' && await evaluate(p, `!document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-next]').disabled`));
        await click(p, '[data-step-next]');
        check(`${width}: estrutura revisada avança sem alterar respostas`, await step(p) === 'detalhes');
        await click(p, '[data-step-back]');
        await choose(p, 'input[name="cameras"][value="5 a 8"]', touch);
        await sleep(600);
        check(`${width}: editar estrutura em revisão não avança automaticamente`, await step(p) === 'estrutura');
        await click(p, '[data-step-next]');
        await click(p, '[data-step-back]'); await click(p, '[data-step-back]'); await sleep(1550);
        check(`${width}: revisar local preenchido habilita Continuar`, await step(p) === 'local' && await evaluate(p, `!document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-next]').disabled`));
        await set(p, '#f-cidade', 'C'); await sleep(350);
        check(`${width}: cidade inválida durante revisão desabilita Continuar`, await step(p) === 'local' && await evaluate(p, `document.querySelector('[data-step-next]').disabled`));
        await click(p, '[data-step-next]');
        check(`${width}: botão desabilitado não avança local inválido`, await step(p) === 'local');
        await set(p, '#f-cidade', 'Cidade Revisada');
        await sleep(1550);
        check(`${width}: corrigir cidade habilita Continuar sem avanço automático`, await step(p) === 'local' && await evaluate(p, `!document.querySelector('[data-step-next]').disabled`));
        await click(p, '[data-step-next]');
        check(`${width}: retorno para estrutura continua em revisão`, await step(p) === 'estrutura' && await evaluate(p, `!document.querySelector('[data-step-next]').hidden`));
        await click(p, '[data-step-back]'); await click(p, '[data-step-back]'); await sleep(350);
        check(`${width}: revisar contato mostra apenas Continuar habilitado`, await step(p) === 'contato' && await evaluate(p, `!document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-next]').disabled&&document.querySelector('[data-step-back]').hidden`));
        await click(p, '[data-step-next]');
        check(`${width}: contato revisado avança sem alterar respostas`, await step(p) === 'local');
        await click(p, '[data-step-back]');
        await set(p, '#f-whatsapp', '123'); await sleep(350);
        check(`${width}: telefone inválido durante revisão desabilita Continuar`, await step(p) === 'contato' && await evaluate(p, `document.querySelector('[data-step-next]').disabled`));
        await set(p, '#f-whatsapp', '21987654321');
        await sleep(350);
        check(`${width}: corrigir telefone em revisão não dispara avanço`, await step(p) === 'contato' && await evaluate(p, `!document.querySelector('[data-step-next]').disabled`));
        await h.send('Page.reload', {}, p);
        await waitUntil(() => evaluate(p, `!!document.querySelector('#f-nome')&&!document.querySelector('#f-nome').matches(':disabled')`), 'restaurar revisão ' + width);
        await sleep(350);
        check(`${width}: recarregamento preserva modo de revisão`, await step(p) === 'contato' && await evaluate(p, `!document.querySelector('[data-step-next]').hidden&&!document.querySelector('[data-step-next]').disabled`));
        await click(p, '[data-step-next]');
        check(`${width}: revisão preserva respostas das demais etapas`, await evaluate(p, `document.querySelector('#f-cidade').value==='Cidade Revisada'&&document.querySelector('input[name="cameras"][value="5 a 8"]').checked&&document.querySelector('#f-msg').value===${JSON.stringify(longMessage)}`));
        await click(p, '[data-step-next]');
        await click(p, '[data-step-next]');
        await click(p, '[data-step-back]');
        await click(p, '[data-step-next]');
        check(`${width}: navegação repetida entre terceira e quarta etapas preserva revisão`, await step(p) === 'detalhes');
        await h.send('Page.close', {}, p);
    }
    const typing = await page('typing', { extraInit: seed('contato', { nome: '' }) });
    await evaluate(typing, `document.querySelector('#f-nome').focus()`);
    for (const character of 'Pessoa Teste') {
        await h.send('Input.insertText', { text: character }, typing);
        await sleep(80);
        if (await step(typing) !== 'contato') throw Error('Avanço interrompeu digitação contínua');
    }
    check('digitação contínua reinicia debounce sem interromper nome', await step(typing) === 'contato');
    await waitUntil(async () => await step(typing) === 'local', 'fim da digitação contínua');
    await click(typing, '[data-step-back]');
    await click(typing, '[data-step-next]');
    check('etapa ainda não concluída mantém primeiro preenchimento após revisar contato', await step(typing) === 'local' && await evaluate(typing, `document.querySelector('[data-step-next]').hidden`));
    await set(typing, '#f-cidade', 'Cidade Após Revisão');
    await waitUntil(async () => await step(typing) === 'estrutura', 'retomar primeiro preenchimento do local');
    check('primeiro preenchimento do local preserva autoavanço por texto', await step(typing) === 'estrutura' && await evaluate(typing, `document.querySelector('[data-step-next]').hidden`));
    await h.send('Page.close', {}, typing);
    const invalidated = await page('invalidated-timer');
    await set(invalidated, '#f-nome', 'Pessoa Teste');
    await set(invalidated, '#f-whatsapp', '11900000000');
    await sleep(100);
    await set(invalidated, '#f-whatsapp', '123');
    await sleep(350);
    check('invalidar contato durante debounce cancela avanço pendente', await step(invalidated) === 'contato');
    await h.send('Page.close', {}, invalidated);
    const reviewMissing = await page('review-required', { extraInit: seed('estrutura', { cameras: '', internet: '' }) + `const draft=JSON.parse(sessionStorage.getItem('dlp_lead_draft_v1:/'));draft.furthestStep=3;sessionStorage.setItem('dlp_lead_draft_v1:/',JSON.stringify(draft));` });
    check('revisão incompleta da estrutura desabilita Continuar', await evaluate(reviewMissing, `!document.querySelector('[data-step-next]').hidden&&document.querySelector('[data-step-next]').disabled`));
    await click(reviewMissing, 'input[name="cameras"][value="1 a 4"]');
    check('uma escolha não habilita revisão com internet ausente', await evaluate(reviewMissing, `document.querySelector('[data-step-next]').disabled`));
    await click(reviewMissing, 'input[name="internet"][value="Não sei"]');
    await sleep(600);
    check('estrutura revisada válida habilita Continuar sem autoavanço', await step(reviewMissing) === 'estrutura' && await evaluate(reviewMissing, `!document.querySelector('[data-step-next]').disabled`));
    await click(reviewMissing, '[data-step-next]');
    check('estrutura revisada incompleta só avança após correção e clique', await step(reviewMissing) === 'detalhes');
    await h.send('Page.close', {}, reviewMissing);
    const c = await page('cancel-auto');
    await set(c, '#f-nome', 'Pessoa Teste');
    await set(c, '#f-whatsapp', '11900000000');
    await evaluate(c, `document.querySelector('[data-track="cta_header"]').focus()`);
    await sleep(1500);
    check('sair do formulário cancela avanço', await step(c) === 'contato');
    await set(c, '#f-whatsapp', '21987654321');
    await evaluate(c, `document.dispatchEvent(new Event('visibilitychange'))`);
    await sleep(1500);
    check('mudança de visibilidade cancela avanço', await step(c) === 'contato');
    await evaluate(c, `document.querySelector('#f-whatsapp').dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}))`);
    await set(c, '#f-whatsapp', '11900000000', { compose: true });
    await key(c, 'Enter');
    await sleep(1500);
    check('composição impede avanço e Enter prematuro', await step(c) === 'contato');
    await evaluate(c, `document.querySelector('#f-whatsapp').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))`);
    await sleep(1500);
    check('fim de composição retoma prazo', await step(c) === 'local');
    const bad = await page('corrupt', { extraInit: `sessionStorage.setItem('dlp_lead_draft_v1:/','{invalid');` });
    check('JSON de rascunho inválido não quebra formulário', await step(bad) === 'contato');
    const sanitized = await page('sanitize', { extraInit: seed('confirmacao', { tipo: 'inventado', consentimento: 'true' }) });
    check('restauração revalida etapa e escolhas adulteradas', await step(sanitized) === 'local' && await evaluate(sanitized, `!document.querySelector('input[name="tipo"]:checked')&&!document.querySelector('input[name="consentimento"]').checked`));
    const storage = await page('storage-blocked', { extraInit: `Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}});` });
    await set(storage, '#f-nome', 'Pessoa Teste');
    await set(storage, '#f-whatsapp', '11900000000');
    await key(storage, 'Enter');
    check('armazenamento bloqueado mantém navegação utilizável', await step(storage) === 'local');
    const hp = await page('honeypot', { extraInit: seed() });
    await set(hp, 'input[name="website"]', 'bot');
    await submit(hp);
    check('honeypot não envia, não confirma e não apaga rascunho', await persisted(hp) && await evaluate(hp, `window.__opens.length===0&&!document.querySelector('[data-thanks]')&&!document.querySelector('[data-lead-form]').hidden&&window.dataLayer.length===0`));
    check('honeypot não é persistido', await evaluate(hp, `!sessionStorage.getItem('dlp_lead_draft_v1:/').includes('website')`));
    await submit(hp);
    check('reenvio com honeypot preenchido continua bloqueado', !h.posts.some(p => p.label === 'honeypot'));
    const ok = await page('success', { config: endpoint, mock: { hold: true }, extraInit: seed(), query: '?utm_source=qa&utm_campaign=teste&gclid=simulado' });
    await evaluate(ok, `document.querySelector('[data-submit]').click();document.querySelector('[data-lead-form]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelector('[data-submit]').click();`);
    await sleep(60);
    check('durante envio controles estão desabilitados', await evaluate(ok, `document.querySelector('#f-nome').matches(':disabled')&&document.querySelector('[data-status]').textContent==='Enviando solicitação...'&&document.querySelector('[data-submit]').disabled&&document.querySelector('[data-submit]').textContent==='Enviando solicitação...'`));
    await waitUntil(() => h.posts.some(post => post.label === 'success'), 'POST do teste de sucesso');
    await h.releaseMock('success');
    await waitUntil(() => evaluate(ok, `!!document.querySelector('[data-thanks]')`), 'feedback confirmado');
    check('duplo clique e submit produzem somente um POST', h.posts.filter(p => p.label === 'success').length === 1);
    check('sucesso confirmado mostra mensagem, limpa rascunho e foca retorno', !(await persisted(ok)) && await evaluate(ok, `document.querySelector('[data-thanks] h3').textContent==='Solicitação enviada com sucesso!'&&document.activeElement.hasAttribute('data-thanks')`));
    check('conversão confirmada emitida uma única vez', await evaluate(ok, `window.dataLayer.filter(e=>e.event==='generate_lead').length===1&&window.__fb.filter(e=>e[0]==='track'&&e[1]==='Lead').length===1&&window.__opens.length===0`));
    const payload = JSON.parse(h.posts.find(p => p.label === 'success').request.postData);
    check('payload contém só campos permitidos, sem metadados ou campos administrativos', payload.nome === fields.nome && payload.whatsapp === '+5511900000000' && payload.consentimento === true && payload.website === '' && !['origem','pagina','enviado_em','status','created_at','id'].some(key=>key in payload));
    check('sucesso contém a descrição exata e nenhum botão/link externo', await evaluate(ok, `document.querySelector('[data-thanks-text]').textContent==='Recebemos suas informações. Em breve, nossa equipe entrará em contato pelo WhatsApp para agendar sua demonstração da Gavions.'&&!document.querySelector('[data-thanks] button,[data-thanks] a')`));
    await evaluate(ok, `window.dispatchEvent(new Event('pagehide'))`);
    check('pagehide não recria rascunho confirmado', !(await persisted(ok)));
    const expected = 'Não foi possível enviar sua solicitação. Por favor, tente novamente.';
    for (const [label, mock, cfg] of [
        ['http400', { status: 400 }, endpoint], ['http500', { status: 500 }, endpoint], ['network', { fail: true }, endpoint],
        ['timeout', { hang: true }, { ...endpoint, requestTimeoutMs: 90 }], ['response', { body: { ok: false } }, endpoint],
    ]) {
        const p = await page(label, { config: cfg, mock, extraInit: seed() });
        await submit(p);
        await waitUntil(async () => (await status(p)) === expected, 'feedback de falha '+label);
        check(label + ': erro exato mantém campos, rascunho e permite tentar novamente', await persisted(p) && await evaluate(p, `document.querySelector('#f-nome').value==='Pessoa Teste'&&!document.querySelector('[data-lead-form]').hidden&&!document.querySelector('#f-nome').matches(':disabled')&&!document.querySelector('[data-submit]').disabled&&window.__opens.length===0&&!document.querySelector('[data-thanks]')&&!window.dataLayer.some(e=>e.event==='generate_lead')`));
        if (label === 'http400') {
            await submit(p);
            await waitUntil(() => h.posts.filter(post => post.label === label).length === 2, 'nova tentativa POST');
            check('nova tentativa após erro faz novo POST', h.posts.filter(x => x.label === label).length === 2);
        }
    }
    const handshake = await page('token-pending', { config: endpoint, mock: { tokenWaitMs: 2100, hold: true }, extraInit: seed() });
    await submit(handshake);
    await sleep(100);
    check('carregamento cobre espera do token e bloqueia cliques consecutivos', await evaluate(handshake, `document.querySelector('[data-submit]').disabled&&document.querySelector('[data-status]').textContent==='Enviando solicitação...'`) && !h.posts.some(p=>p.label==='token-pending'));
    await waitUntil(() => h.posts.some(p=>p.label==='token-pending'), 'POST após maturação do token');
    await h.releaseMock('token-pending');
    await waitUntil(() => evaluate(handshake, `!!document.querySelector('[data-thanks]')`), 'sucesso após token');
    for (const width of [320, 390, 768, 1440]) {
        for (const [state, mock] of [['sending',{hold:true}],['error',{status:500}],['success',{}]]) {
            const label = `responsive-${width}-${state}`;
            const p = await page(label, { width, height: 900, config: endpoint, mock, extraInit: seed() });
            await submit(p);
            await waitUntil(() => h.posts.some(post => post.label === label), label + ' POST');
            if (state === 'success') await waitUntil(() => evaluate(p, `!!document.querySelector('[data-thanks]')`), label);
            if (state === 'error') await waitUntil(async () => (await status(p)) === expected, label);
            check(label + ': formulário cabe no viewport', await evaluate(p, `(()=>{const e=document.querySelector('${state==='success'?'[data-thanks]':'[data-lead-form]'}');const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1})()`));
            await evaluate(p, `document.querySelector('${state==='success'?'[data-thanks]':'[data-lead-form]'}').scrollIntoView({block:'center',behavior:'instant'})`);
            await sleep(650);
            await h.screenshot(p, label + '.png');
            if (state === 'sending') { await h.releaseMock(label); await waitUntil(() => evaluate(p, `!!document.querySelector('[data-thanks]')`), label + ' cleanup'); }
        }
    }
    const events = await page('events');
    await click(events, '[data-track="cta_header"]');
    for (const id of ['inicio', 'cameras', 'alertas', 'protecao', 'imoveis'])
        await click(events, '#t-' + id);
    await click(events, '[data-sim-replay]');
    check('CTA, cinco abas e replay emitem eventos equivalentes', await evaluate(events, `window.dataLayer.filter(e=>e.event==='cta_click'&&e.cta==='cta_header').length===1&&window.dataLayer.filter(e=>e.event==='app_tab').length===5&&window.dataLayer.filter(e=>e.event==='sim_replay').length===1`));
    const nojs = await page('no-js', { jsDisabled: true });
    check('sem JS: campos desabilitados, sem nomes e sem dados serializáveis', await evaluate(nojs, `(()=>{const f=document.querySelector('[data-lead-form]');return f.method==='post'&&[...f.querySelectorAll('input,textarea')].every(e=>e.matches(':disabled')&&!e.name)&&[...new FormData(f)].length===0&&[...f.querySelectorAll('button')].every(e=>e.type==='button')&&f.querySelector('noscript').textContent.includes('Ative o JavaScript')})()`));
    const pre = await page('pre-hydration', { blockScripts: true });
    check('antes da hidratação: controles inertes sem nomes e método POST', await evaluate(pre, `document.querySelector('#f-nome').matches(':disabled')&&!document.querySelector('#f-nome').name&&new FormData(document.querySelector('[data-lead-form]')).entries().next().done&&document.querySelector('[data-lead-form]').method==='post'`));
    const cleanup = await page('cleanup');
    await set(cleanup, '#f-nome', 'Pessoa Teste');
    await set(cleanup, '#f-whatsapp', '11900000000');
    const listeners = await evaluate(cleanup, `window.__listeners.filter(e=>e.active).length`);
    await evaluate(cleanup, `window.next.router.push('/__qa_cleanup_check')`);
    await waitUntil(() => evaluate(cleanup, `!Object.values(window.__qa.activeTimers).some(ms=>ms===250||ms===450||ms===1400)&&window.__listeners.filter(e=>e.active).length<${listeners}`), 'limpeza após desmontagem');
    check('desmontagem cancela timers de avanço e remove listeners do formulário', await evaluate(cleanup, `!Object.values(window.__qa.activeTimers).some(ms=>ms===250||ms===450||ms===1400)&&window.__listeners.filter(e=>e.active).length<${listeners}`));
    const pending = await page('cleanup-pending', { config: endpoint, mock: { hang: true }, extraInit: seed() });
    await submit(pending);
    await waitUntil(() => h.posts.some(post => post.label === 'cleanup-pending'), 'POST pendente antes da navegação');
    await evaluate(pending, `window.next.router.push('/__qa_cleanup_check')`);
    await sleep(300);
    const history = await h.send('Page.getNavigationHistory', {}, pending);
    await h.send('Page.navigateToHistoryEntry', { entryId: history.entries[history.currentIndex - 1].id }, pending);
    await waitUntil(async () => {
        try { return await evaluate(pending, `!!document.querySelector('#f-nome')&&!document.querySelector('#f-nome').matches(':disabled')`); }
        catch (error) {
            if (/Inspected target navigated or closed|Execution context was destroyed|Cannot find context/.test(String(error))) return false;
            throw error;
        }
    }, 'retorno à página após cancelamento');
    check('navegação com envio pendente cancela e permite retomar sem ficar bloqueado', await evaluate(pending, `!document.querySelector('#f-nome').matches(':disabled')&&!(window.dataLayer||[]).some(e=>e.event==='generate_lead')`) && await persisted(pending));
    check('sem exceções de aplicação ou erros de hidratação', h.logs.errors.length === 0 && !h.logs.console.some(e => e.type === 'error'));
    check('nenhuma requisição comercial ou recurso externo executado', h.logs.blocked.length === 0 && h.logs.requests.every(e => new URL(e.url).origin === h.nextOrigin));
    const leaks = h.logs.requests.some(r => r.url.includes('Pessoa') || r.url.includes('90000') || r.url.includes('qa%40example'));
    check('dados do formulário ausentes nas URLs das requisições', !leaks);
}
catch (e) {
    failed = String(e);
    console.log(failed);
    console.log(JSON.stringify({ lastPosts: h.posts.map(p => p.label), errors: h.logs.errors }));
}
finally {
    await writeFile(h.output + '/report.json', JSON.stringify({ results, failed, logs: h.logs, posts: h.posts.map(p => ({ label: p.label, method: p.request.method, url: p.request.url })) }, null, 2));
    await h.stop();
}
if (failed)
    process.exitCode = 1;
