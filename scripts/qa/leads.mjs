import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { projectRoot, outputDir, baseUrl, fakeLeadConfig } from './config.mjs';
const require = createRequire(import.meta.url);
const output = outputDir('leads');
const compiled = path.join(output, 'compiled');
globalThis.fetch = () => { throw new Error('Requisição real proibida no teste unitário.'); };
const ts = require(path.join(projectRoot, 'node_modules/typescript'));
for (const file of ['lib/leads/types.ts', 'lib/leads/rules.ts', 'lib/leads/formatting.ts', 'lib/leads/validation.ts', 'lib/leads/transport.ts', 'lib/analytics.ts']) {
    const target = path.join(compiled, file.replace(/\.ts$/, '.js'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, ts.transpileModule(fs.readFileSync(path.join(projectRoot, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const root = compiled + path.sep;
const { emptyFields, locationTypes } = require(root + 'lib/leads/types'), f = require(root + 'lib/leads/formatting'), v = require(root + 'lib/leads/validation'), { sendLead } = require(root + 'lib/leads/transport'), { track } = require(root + 'lib/analytics');
const base = { ...fakeLeadConfig, leadEndpoint: baseUrl + '/__lead-mock', requestTimeoutMs: 25 };
const valid = { ...emptyFields, cameras: '1 a 4', internet: 'Não sei', nome: 'Pessoa Teste', whatsapp: '(11) 90000-0000', cidade: 'Cidade Teste', tipo: 'Obra', consentimento: true };
const lead = f.collectLead({ ...valid, email: 'qa@example.invalid', mensagem: 'Mensagem sintética' }, { utm_source: 'qa', gclid: 'mock' }, baseUrl + '/');
const mock = post => (url, options) => url === '/api/leads/token' ? Promise.resolve(Response.json({ token: 'synthetic-token', waitMs: 0 })) : post(url, options);
const results = [];
async function test(name, fn) { try {
    await fn();
    results.push({ name, pass: true });
}
catch (e) {
    results.push({ name, pass: false, error: String(e) });
    throw e;
} }
(async () => {
    try {
        await test('máscara brasileira, prefixo e normalização', () => { assert.equal(f.formatPhone('+55 11 90000-0000'), '(11) 90000-0000'); assert.equal(f.formatPhone('1133334444'), '(11) 3333-4444'); assert.equal(f.formatPhone('123'), '(' + '12) 3'); assert.equal(lead.whatsapp, '+5511900000000'); });
        await test('todos os obrigatórios e campos opcionais', () => { assert.deepEqual(v.validate(valid), {}); for (const key of ['nome', 'whatsapp', 'cidade', 'tipo', 'cameras', 'internet', 'consentimento'])
            assert.equal(v.validate({ ...valid, [key]: key === 'consentimento' ? false : '' })[key], true); assert.equal(v.validate({ ...valid, email: 'incorreto' }).email, true); for (const tipo of locationTypes)
            assert.equal(v.invalidField({ ...valid, tipo }, 'tipo'), false); });
        await test('campos opcionais só avançam automaticamente se completos', () => { assert.equal(v.stepComplete(valid, 0), true); assert.equal(v.stepComplete(valid, 1), true); assert.equal(v.stepComplete({ ...valid, cameras: '', internet: '' }, 2), false); assert.equal(v.stepComplete({ ...valid, cameras: '1 a 4', internet: 'Não sei' }, 2), true); assert.equal(v.stepComplete(valid, 3), false); assert.equal(v.stepComplete({ ...valid, email: 'qa@example.invalid', mensagem: 'Teste' }, 3), true); assert.equal(v.stepComplete(valid, 4), false); });
        await test('rascunhos malformados e adulterados são limitados e revalidados', () => { for (const value of [null, [], {}, 'erro'])
            assert.equal(v.restoreDraft(value).step, 0); const restored = v.restoreDraft({ step: 'confirmacao', fields: { ...valid, nome: 'x'.repeat(200), tipo: 'inventado', cameras: 'invalid', consentimento: 'true', website: 'robô' } }); assert.equal(restored.fields.nome.length, 80); assert.equal(restored.fields.tipo, ''); assert.equal(restored.fields.cameras, ''); assert.equal(restored.fields.consentimento, false); assert.equal(restored.step, 1); assert.equal('website' in restored.fields, false); assert.equal(v.restoreDraft({ step: 'confirmacao', fields: valid }).step, 4); });
        await test('POST JSON envia somente campos permitidos, honeypot e token', async () => {
            let got;
            assert.deepEqual(await sendLead(lead, base, undefined, mock(async (u, o) => { got = { u, o }; return Response.json({ ok: true }, { status: 201 }); })), { kind: 'confirmed' });
            assert.equal(got.u, base.leadEndpoint); assert.equal(got.o.method, 'POST'); assert.equal(got.o.headers['Content-Type'], 'application/json');
            assert.equal(got.o.headers['X-Lead-Token'], 'synthetic-token'); const body = JSON.parse(got.o.body);
            assert.equal(body.nome, lead.nome); assert.equal(body.website, ''); assert.equal(body.consentimento, true);
            for (const key of ['origem', 'pagina', 'enviado_em', 'status', 'created_at', 'id']) assert.equal(key in body, false);
        });
        await test('HTTP 4xx/5xx não confirma', async () => { for (const status of [400, 422, 500, 503])
            assert.deepEqual(await sendLead(lead, base, undefined, mock(async () => new Response('Falha', { status }))), { kind: 'failed', reason: 'http', status }); });
        await test('contrato JSON exige confirmação explícita', async () => { const cfg = { ...base, responseContract: { kind: 'json', field: 'ok', value: true } }; assert.deepEqual(await sendLead(lead, cfg, undefined, mock(async () => Response.json({ ok: true }))), { kind: 'confirmed' }); for (const body of [{ ok: false }, {}, [], null])
            assert.equal((await sendLead(lead, cfg, undefined, mock(async () => Response.json(body)))).reason, 'response'); assert.equal((await sendLead(lead, cfg, undefined, mock(async () => new Response('invalid')))).reason, 'response'); });
        await test('falha de rede não expõe exceção nem dados', async () => { assert.deepEqual(await sendLead(lead, base, undefined, mock(async () => { throw new Error(lead.nome); })), { kind: 'failed', reason: 'network' }); });
        await test('timeout aborta transporte pendente', async () => { let signal; const result = await sendLead(lead, base, undefined, mock(async (u, o) => { signal = o.signal; return new Promise(() => { }); })); assert.deepEqual(result, { kind: 'failed', reason: 'timeout' }); assert.equal(signal.aborted, true); });
        await test('timeout inclui leitura da confirmação', async () => { assert.equal((await sendLead(lead, { ...base, responseContract: { kind: 'json', field: 'ok', value: true } }, undefined, mock(async () => ({ ok: true, status: 200, json: () => new Promise(() => { }) })))).reason, 'timeout'); });
        await test('cancelamento do usuário e sinal já cancelado', async () => { let called = 0; const c = new AbortController(); const task = sendLead(lead, base, c.signal, mock(async () => { called++; return new Promise(() => { }); })); setTimeout(() => c.abort(), 5); assert.equal((await task).reason, 'aborted'); assert.equal(called, 1); assert.equal((await sendLead(lead, base, c.signal, mock(async () => { called++; }))).reason, 'aborted'); assert.equal(called, 1); });
        await test('resolução após cancelamento não confirma e listeners são removidos', async () => { let resolve; const c = new AbortController(); let adds = 0, removes = 0; const add = c.signal.addEventListener.bind(c.signal), remove = c.signal.removeEventListener.bind(c.signal); c.signal.addEventListener = (...args) => { adds++; return add(...args); }; c.signal.removeEventListener = (...args) => { removes++; return remove(...args); }; const task = sendLead(lead, base, c.signal, mock(() => new Promise(r => resolve = r))); await new Promise(r => setTimeout(r, 5)); c.abort(); assert.equal((await task).reason, 'aborted'); resolve(new Response('')); assert.equal(adds, removes); });
        await test('analytics allowlist exclui dados pessoais e eventos falsos', () => { const dl = [], gt = [], fb = []; const collectors = { dataLayer: dl, gtag: (...a) => gt.push(a), fbq: (...a) => fb.push(a) }; for (const [name, data] of [['cta_click', { cta: 'cta_hero' }], ['app_tab', { tab: 't-alertas' }], ['sim_replay', {}], ['generate_lead', { method: 'endpoint', tipo_local: 'Obra' }], ['lead_fallback', { method: 'email' }]])
            track(name, { ...data, nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email, mensagem: lead.mensagem }, collectors); assert.equal(dl.length, 5); assert.equal(gt.length, 5); assert.equal(fb.length, 5); assert.deepEqual(fb[3], ['track', 'Lead']); for (const entry of [lead.nome, lead.whatsapp, lead.email, lead.mensagem])
            assert.equal(JSON.stringify([dl, gt, fb]).includes(entry), false); for (const [name, data] of [['generate_lead', { method: 'email' }], ['cta_click', { cta: lead.nome }], ['app_tab', { tab: lead.email }], ['lead_fallback', { method: lead.whatsapp }], ['inventado', {}]])
            track(name, data, collectors); assert.equal(dl.length, 5); });
        await test('falha de um coletor não impede os demais nem interface', () => { const dl = [], fb = []; track('sim_replay', {}, { dataLayer: dl, gtag: () => { throw Error('mock'); }, fbq: (...a) => fb.push(a) }); assert.equal(dl.length, 1); assert.equal(fb.length, 1); track('sim_replay', {}); });
    }
    finally {
        fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(results, null, 2));
        console.log(JSON.stringify({ output, total: results.length, passed: results.filter(r => r.pass).length, failed: results.filter(r => !r.pass) }));
    }
})().catch(() => process.exitCode = 1);
