import { openHarness, sleep, waitUntil } from './browser.mjs';
import { writeFile } from 'node:fs/promises';
import { outputDir, fakeLeadConfig } from './config.mjs';
const h = await openHarness(outputDir('form'));
const fixtureOrigin = h.nextOrigin;
const results = [];
let failed;
const fields = { nome: 'Pessoa Teste', whatsapp: '(11) 90000-0000', email: '', empresa: '', cidade: 'Cidade Teste', tipo: 'Obra', cameras: '', internet: '', mensagem: '', consentimento: true };
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
async function click(s, sel) { await evaluate(s, `document.querySelector(${JSON.stringify(sel)}).click()`); await sleep(40); }
async function step(s) { return evaluate(s, `document.querySelector('[data-form-step]:not([hidden])').dataset.formStep`); }
async function key(s, key) { await h.send('Input.dispatchKeyEvent', { type: 'keyDown', key }, s); await h.send('Input.dispatchKeyEvent', { type: 'keyUp', key }, s); await sleep(50); }
const status = s => evaluate(s, `document.querySelector('[data-status]').textContent`);
const persisted = s => evaluate(s, `Boolean(sessionStorage.getItem('dlp_lead_draft_v1:/'))`);
const submit = s => click(s, '[data-submit]');
try {
    const s = await page('navigation');
    await click(s, '[data-step-next]');
    check('nome e telefone vazios: erros, ARIA e foco', await evaluate(s, `document.activeElement.id==='f-nome'&&document.querySelector('#f-nome').getAttribute('aria-invalid')==='true'&&document.querySelector('#f-whatsapp').getAttribute('aria-describedby')==='e-whatsapp'`));
    await set(s, '#f-nome', 'P');
    await set(s, '#f-whatsapp', '123');
    await click(s, '[data-step-next]');
    check('nome curto e telefone inválido impedem avanço', await step(s) === 'contato');
    await set(s, '#f-nome', 'Pessoa Teste');
    await set(s, '#f-whatsapp', '+55 11 90000-0000');
    check('máscara aplicada na interface', await evaluate(s, `document.querySelector('#f-whatsapp').value==='(11) 90000-0000'`));
    await key(s, 'Enter');
    check('Enter avança contato e foca Empresa', await step(s) === 'local' && await evaluate(s, `document.activeElement.id==='f-empresa'`));
    await sleep(1500);
    check('timer anterior cancelado ao avançar manualmente', await step(s) === 'local');
    await click(s, '[data-step-next]');
    check('cidade e tipo obrigatórios com foco correto', await step(s) === 'local' && await evaluate(s, `document.activeElement.id==='f-cidade'&&document.querySelector('input[name="tipo"]').getAttribute('aria-invalid')==='true'`));
    await set(s, '#f-cidade', 'Cidade Teste');
    await click(s, 'input[name="tipo"][value="Obra"]');
    await click(s, '[data-step-next]');
    check('Empresa opcional e navegação para estrutura', await step(s) === 'estrutura');
    await key(s, 'Enter');
    // Explicit button skips optional groups, including a group with no focused radio.
    if (await step(s) === 'estrutura')
        await click(s, '[data-step-next]');
    check('grupos de estrutura vazios podem ser pulados', await step(s) === 'detalhes');
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
    await submit(s);
    check('configuração fictícia prepara e-mail sem afirmar recebimento', await evaluate(s, `document.querySelector('[data-lead-form]').hidden&&document.querySelector('[data-thanks] h3').textContent==='Envio pelo e-mail'&&window.__opens.length===1&&window.__opens[0].url.startsWith('mailto:qa@example.invalid?')`));
    check('encaminhamento mantém rascunho, foco e não emite conversão', await persisted(s) && await evaluate(s, `document.activeElement.hasAttribute('data-thanks')&&!window.dataLayer.some(e=>e.event==='generate_lead')`));
    const before = await evaluate(s, 'location.href');
    await evaluate(s, `document.querySelector('[data-lead-form]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
    await sleep(50);
    check('encaminhamento não duplica em submit repetido e não altera URL do site', await evaluate(s, `window.__opens.length===1&&location.href===${JSON.stringify(before)}`));
    await click(s, '[data-thanks] button');
    check('retorno do encaminhamento permite revisar dados', await step(s) === 'confirmacao' && await evaluate(s, `!document.querySelector('[data-lead-form]').hidden&&document.activeElement.name==='consentimento'`));
    await click(s, '[data-step-back]');
    check('Voltar preserva valores e foco', await step(s) === 'detalhes' && await evaluate(s, `document.activeElement.id==='f-email'`));
    await h.send('Page.reload', {}, s);
    await sleep(1100);
    check('recarregamento restaura etapa e dados originais', await step(s) === 'detalhes' && await evaluate(s, `document.querySelector('#f-nome').value==='Pessoa Teste'&&document.querySelector('input[name="consentimento"]').checked`));
    const a = await page('auto');
    await set(a, '#f-nome', 'Pessoa Teste');
    await set(a, '#f-whatsapp', '11900000000');
    await sleep(1150);
    check('texto aguarda o prazo original', await step(a) === 'contato');
    await sleep(350);
    check('texto avança após 1400 ms', await step(a) === 'local');
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
    check('detalhes completos avançam automaticamente', await step(a) === 'confirmacao');
    const c = await page('cancel-auto');
    await set(c, '#f-nome', 'Pessoa Teste');
    await set(c, '#f-whatsapp', '11900000000');
    await evaluate(c, `document.querySelector('[data-track="cta_header"]').focus()`);
    await sleep(1500);
    check('sair do formulário cancela avanço', await step(c) === 'contato');
    await set(c, '#f-whatsapp', '11900000000');
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
    check('após bloqueio formulário permanece utilizável', await evaluate(hp, `window.__opens.length===1`));
    const ok = await page('success', { config: endpoint, mock: { hold: true }, extraInit: seed(), query: '?utm_source=qa&utm_campaign=teste&gclid=simulado' });
    await evaluate(ok, `document.querySelector('[data-submit]').click();document.querySelector('[data-lead-form]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelector('[data-submit]').click();`);
    await sleep(60);
    check('durante envio controles estão desabilitados', await evaluate(ok, `document.querySelector('#f-nome').matches(':disabled')&&document.querySelector('[data-status]').textContent==='Enviando…'`));
    await waitUntil(() => h.posts.some(post => post.label === 'success'), 'POST do teste de sucesso');
    await h.releaseMock('success');
    await waitUntil(() => evaluate(ok, `!!document.querySelector('[data-thanks]')`), 'feedback confirmado');
    check('duplo clique e submit produzem somente um POST', h.posts.filter(p => p.label === 'success').length === 1);
    check('sucesso confirmado mostra mensagem, limpa rascunho e foca retorno', !(await persisted(ok)) && await evaluate(ok, `document.querySelector('[data-thanks] h3').textContent==='Pedido recebido!'&&document.activeElement.hasAttribute('data-thanks')`));
    check('conversão confirmada emitida uma única vez', await evaluate(ok, `window.dataLayer.filter(e=>e.event==='generate_lead').length===1&&window.__fb.filter(e=>e[0]==='track'&&e[1]==='Lead').length===1&&window.__opens.length===0`));
    const payload = JSON.parse(h.posts.find(p => p.label === 'success').request.postData);
    check('payload original e atribuição preservados em POST JSON', payload.nome === fields.nome && payload.whatsapp === '+5511900000000' && payload.consentimento === true && payload.origem.utm_source === 'qa' && payload.origem.utm_campaign === 'teste' && payload.origem.gclid === 'simulado' && payload.origem.landing.includes('?utm_source=qa') && !('website' in payload));
    await evaluate(ok, `window.dispatchEvent(new Event('pagehide'))`);
    check('pagehide não recria rascunho confirmado', !(await persisted(ok)));
    for (const [label, mock, cfg, expected] of [
        ['http400', { status: 400 }, endpoint, 'Não foi possível registrar'], ['http500', { status: 500 }, endpoint, 'Não foi possível registrar'], ['network', { fail: true }, endpoint, 'Não foi possível enviar agora'], ['timeout', { hang: true }, { ...endpoint, requestTimeoutMs: 90 }, 'tempo limite'], ['response', { body: { ok: false } }, { ...endpoint, responseContract: { kind: 'json', field: 'ok', value: true } }, 'não confirmou'],
    ]) {
        const p = await page(label, { config: cfg, mock, extraInit: seed() });
        await submit(p);
        await waitUntil(async () => (await status(p)).includes(expected), 'feedback de falha '+label);
        check(label + ': falha mantém dados e permite tentativa', await persisted(p) && (await status(p)).includes(expected) && await evaluate(p, `!document.querySelector('[data-lead-form]').hidden&&!document.querySelector('#f-nome').matches(':disabled')&&window.__opens.length===0&&!window.dataLayer.some(e=>e.event==='generate_lead')`));
        if (label === 'http500') {
            await click(p, '[data-lead-form] > button:last-of-type');
            check('fallback escolhido explicitamente abre e-mail simulado e mantém rascunho', await persisted(p) && await evaluate(p, `window.__opens.length===1&&window.dataLayer.filter(e=>e.event==='lead_fallback'&&e.method==='email').length===1&&!window.dataLayer.some(e=>e.event==='generate_lead')`));
        }
        if (label === 'http400') {
            await submit(p);
            await waitUntil(() => h.posts.filter(post => post.label === label).length === 2, 'nova tentativa POST');
            check('nova tentativa após erro faz novo POST', h.posts.filter(x => x.label === label).length === 2);
        }
    }
    const cancel = await page('cancel-request', { config: endpoint, mock: { hang: true }, extraInit: seed() });
    await submit(cancel);
    await click(cancel, '[data-lead-form] > button');
    await sleep(80);
    check('cancelamento explícito preserva dados e desbloqueia controles', (await status(cancel)).includes('cancelado') && await persisted(cancel) && await evaluate(cancel, `!document.querySelector('#f-nome').matches(':disabled')`));
    const formEncoded = await page('form-urlencoded', { config: { ...endpoint, leadEndpointFormat: 'form' }, extraInit: seed() });
    await submit(formEncoded);
    await waitUntil(() => h.posts.some(post => post.label === 'form-urlencoded'), 'POST form-urlencoded');
    const post = h.posts.find(x => x.label === 'form-urlencoded').request;
    const params = new URLSearchParams(post.postData);
    check('POST form-urlencoded no navegador preserva codificação nativa', post.headers['Content-Type'].startsWith('application/x-www-form-urlencoded') && params.get('whatsapp') === '+5511900000000' && params.get('consentimento') === 'true' && params.has('origem_landing'));
    const ack = await page('json-ack', { config: { ...endpoint, responseContract: { kind: 'json', field: 'ok', value: true } }, extraInit: seed() });
    await submit(ack);
    await waitUntil(() => evaluate(ack, `!!document.querySelector('[data-thanks]')`), 'confirmação JSON');
    check('confirmação JSON válida aceita na interface', await evaluate(ack, `document.querySelector('[data-thanks] h3').textContent==='Pedido recebido!'`));
    const wa = await page('whatsapp-mock', { config: { ...base, whatsappNumber: '5500000000000' }, extraInit: seed() });
    await submit(wa);
    check('WhatsApp simulado tem prioridade e não registra conversão', await persisted(wa) && await evaluate(wa, `window.__opens.length===1&&window.__opens[0].url.startsWith('https://wa.me/5500000000000?')&&document.querySelector('[data-thanks] h3').textContent==='Envio pelo WhatsApp'&&!window.dataLayer.some(e=>e.event==='generate_lead')`));
    const none = await page('no-destination', { config: { ...base, contactEmail: '' }, extraInit: seed() });
    await submit(none);
    check('nenhum destino: aviso explícito, sem envio e dados mantidos', await persisted(none) && (await status(none)).includes('Nada foi enviado') && await evaluate(none, `!document.querySelector('[data-cfg-warning]').hidden&&window.__opens.length===0`));
    const attr = await page('origin-restore', { config: endpoint, extraInit: seed() + `sessionStorage.setItem('dlp_origem',JSON.stringify({utm_source:'anterior',landing:'${fixtureOrigin}/inicial',referrer:'${fixtureOrigin}/referencia',email:'ignorar',utm_term:123,fbclid:'x'.repeat(400)}));`, query: '?utm_medium=qa' });
    await submit(attr);
    await waitUntil(() => h.posts.some(post => post.label === 'origin-restore'), 'POST de atribuição');
    const origin = JSON.parse(h.posts.find(p => p.label === 'origin-restore').request.postData).origem;
    check('atribuição restaura origem inicial e filtra tipos/chaves/tamanhos', origin.utm_source === 'anterior' && origin.utm_medium === 'qa' && origin.landing === `${h.nextOrigin}/inicial` && origin.referrer === `${h.nextOrigin}/referencia` && origin.fbclid.length === 200 && !('email' in origin) && !('utm_term' in origin));
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
    await sleep(1700);
    check('desmontagem cancela timers de avanço e remove listeners do formulário', await evaluate(cleanup, `!Object.values(window.__qa.activeTimers).some(ms=>ms===450||ms===1400)&&window.__listeners.filter(e=>e.active).length<${listeners}`));
    const pending = await page('cleanup-pending', { config: endpoint, mock: { hang: true }, extraInit: seed() });
    await submit(pending);
    await waitUntil(() => h.posts.some(post => post.label === 'cleanup-pending'), 'POST pendente antes da navegação');
    await evaluate(pending, `window.next.router.push('/__qa_cleanup_check')`);
    await sleep(300);
    await evaluate(pending, `history.back()`);
    await waitUntil(() => evaluate(pending, `!!document.querySelector('#f-nome')&&!document.querySelector('#f-nome').matches(':disabled')`), 'retorno à página após cancelamento');
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
