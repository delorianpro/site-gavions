import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { projectRoot, outputDir } from './config.mjs';
const require = createRequire(import.meta.url);
const ts = require(path.join(projectRoot, 'node_modules/typescript'));
const output = outputDir('leads-api');
const compiled = path.join(output, 'compiled');
// server-only is a Next build guard, replaced ONLY in this isolated test directory.
fs.mkdirSync(path.join(compiled, 'node_modules/server-only'), { recursive: true });
fs.writeFileSync(path.join(compiled, 'node_modules/server-only/index.js'), '');
for (const file of ['types', 'rules', 'server']) {
  fs.writeFileSync(path.join(compiled, file + '.js'), ts.transpileModule(fs.readFileSync(path.join(projectRoot, `lib/leads/${file}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}
globalThis.fetch = () => { throw Error('Remote requests are forbidden in QA'); };
const { createLeadHandlers } = require(path.join(compiled, 'server.js'));
const { leadErrorMessage } = require(path.join(compiled, 'types.js'));
const env = { SUPABASE_URL: 'https://supabase.example.invalid', SUPABASE_SECRET_KEY: 'synthetic-test-key-not-a-credential' };
const origin = 'https://gavions.example.invalid';
const valid = { nome: ' Pessoa Teste ', whatsapp: '(11) 91234-5678', empresa: '', cidade: ' Cidade Teste ', tipo_local: 'Obra', cameras: '1 a 4', internet: 'Não sei', email: '', mensagem: '', consentimento: true, website: '' };
const results = [];
let now = 1800000000000, posts = [], fetcher = async (url, options) => { posts.push({ url, options }); return new Response(null, { status: 201 }); };
const api = createLeadHandlers({ env: () => env, now: () => now, fetcher: (...args) => fetcher(...args) });
const issue = () => api.token(new Request(origin + '/api/leads/token', { headers: { 'sec-fetch-site': 'same-origin' } }));
let token;
function request(body = valid, headers = {}, raw) {
  return new Request(origin + '/api/leads', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Lead-Token': token, ...headers }, body: raw ?? JSON.stringify(body) });
}
async function test(name, fn) {
  await fn(); results.push({ name, pass: true }); console.log(JSON.stringify(results.at(-1)));
}
async function rejects(body, status = 422, headers, raw) {
  const count = posts.length;
  const response = await api.post(request(body, headers, raw));
  assert.equal(response.status, status);
  assert.deepEqual(await response.json(), { ok: false, message: leadErrorMessage });
  assert.equal(posts.length, count);
}
try {
  await test('token público assinado, sem segredo, sem cache', async () => {
    const response = await issue(); assert.equal(response.status, 200);
    const body = await response.json(); token = body.token;
    assert.equal(body.waitMs, 2100); assert.equal(token.includes(env.SUPABASE_SECRET_KEY), false);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
  await test('token recente, ausente, adulterado, futuro e expirado são recusados', async () => {
    await rejects(valid, 403); now += 2100;
    await rejects(valid, 403, { 'X-Lead-Token': '' });
    await rejects(valid, 403, { 'X-Lead-Token': token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a') });
    now -= 5000; await rejects(valid, 403); now += 5000;
    now += 900001; await rejects(valid, 403); now -= 900001;
  });
  await test('inserção válida usa somente apikey, POST e return=minimal', async () => {
    const response = await api.post(request()); assert.equal(response.status, 201); assert.deepEqual(await response.json(), { ok: true });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const { url, options } = posts.at(-1); assert.equal(url, env.SUPABASE_URL + '/rest/v1/leads');
    assert.equal(options.method, 'POST'); assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
    assert.equal(options.headers.Prefer, 'return=minimal'); assert.equal(options.headers['Content-Profile'], 'public');
    assert.equal('Authorization' in options.headers, false); assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error');
    assert.deepEqual(JSON.parse(options.body), { name: 'Pessoa Teste', whatsapp: '+5511912345678', company: null, city: 'Cidade Teste', property_type: 'Obra', camera_quantity: '1 a 4', internet_type: 'Não sei', email: null, notes: null, contact_consent: true });
  });
  await test('opcionais ausentes, vazios ou com espaços viram NULL', async () => {
    const body = { ...valid }; for (const key of ['empresa', 'email', 'mensagem', 'website']) delete body[key];
    assert.equal((await api.post(request(body))).status, 201);
    assert.equal((await api.post(request({ ...valid, empresa: '  ', email: ' ', mensagem: '  ' }))).status, 201);
    assert.equal(JSON.parse(posts.at(-1).options.body).company, null);
  });
  await test('normaliza domínio de e-mail, Unicode e observações', async () => {
    assert.equal((await api.post(request({ ...valid, nome: ' Jose\u0301 ', email: 'Pessoa@EXAMPLE.COM', mensagem: ' Observação\nsegunda linha ' }))).status, 201);
    const row = JSON.parse(posts.at(-1).options.body); assert.equal(row.name, 'José'); assert.equal(row.email, 'Pessoa@example.com'); assert.equal(row.notes, 'Observação\nsegunda linha');
  });
  for (const key of ['nome', 'whatsapp', 'cidade', 'tipo_local', 'cameras', 'internet', 'consentimento']) {
    await test(`obrigatório ausente/vazio: ${key}`, async () => {
      const body = { ...valid }; delete body[key]; await rejects(body);
      await rejects({ ...valid, [key]: key === 'consentimento' ? false : '' });
    });
  }
  await test('tipos incorretos, consentimento textual e arrays recusados', async () => {
    for (const key of Object.keys(valid)) for (const value of [null, [], {}, 123]) await rejects({ ...valid, [key]: value });
    await rejects({ ...valid, consentimento: 'true' }); for (const value of [null, [], 'text', 42]) await rejects(value);
  });
  await test('WhatsApp inválido, DDD inexistente, truncamentos e letras recusados', async () => {
    for (const whatsapp of ['123', '00912345678', '11999999999', '11912345678999', 'abc11912345678', '+4411912345678', '1101234567', '1133333333']) await rejects({ ...valid, whatsapp });
    assert.equal((await api.post(request({ ...valid, whatsapp: '+55 (21) 98765-4321' }))).status, 201);
  });
  await test('e-mail inválido recusado', async () => {
    for (const email of ['invalid', 'x@@example.com', 'x@y', 'x @example.com', 'x@-example.com', 'x..x@example.com', 'x@example..com']) await rejects({ ...valid, email });
  });
  await test('listas fechadas de opções', async () => {
    for (const key of ['tipo_local', 'cameras', 'internet']) await rejects({ ...valid, [key]: 'inventado' });
  });
  await test('limites e controles nos textos', async () => {
    for (const [key, max] of [['nome', 80], ['whatsapp', 32], ['empresa', 80], ['cidade', 60], ['tipo_local', 80], ['cameras', 40], ['internet', 40], ['email', 120], ['mensagem', 600], ['website', 200]]) await rejects({ ...valid, [key]: 'x'.repeat(max + 1) });
    await rejects({ ...valid, nome: 'Nome\u0000' }); await rejects({ ...valid, cidade: 'Cidade\nOutra' });
  });
  await test('honeypot e campos administrativos recusados', async () => {
    await rejects({ ...valid, website: 'bot' }, 403);
    for (const key of ['status', 'created_at', 'id', 'contact_consent']) await rejects({ ...valid, [key]: 'inventado' });
  });
  await test('origem ausente, externa, Fetch Metadata e token de outra origem recusados', async () => {
    await rejects(valid, 403, { Origin: '' }); await rejects(valid, 403, { Origin: 'https://external.example.invalid' });
    await rejects(valid, 403, { 'sec-fetch-site': 'cross-site' });
    const other = new Request('https://other.example.invalid/api/leads', { method: 'POST', headers: { Origin: 'https://other.example.invalid', 'Content-Type': 'application/json', 'X-Lead-Token': token }, body: JSON.stringify(valid) });
    assert.equal((await api.post(other)).status, 403);
    assert.equal((await api.token(new Request(origin + '/api/leads/token', { headers: { 'sec-fetch-site': 'cross-site' } }))).status, 403);
  });
  await test('JSON malformado, mídia incorreta, limite por header e bytes reais', async () => {
    await rejects(valid, 400, {}, '{invalid'); await rejects(valid, 415, { 'Content-Type': 'text/plain' });
    await rejects(valid, 413, { 'Content-Length': '9000' }); await rejects(valid, 413, {}, JSON.stringify({ nome: 'é'.repeat(5000) }));
    const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(' '.repeat(5000))); c.enqueue(new TextEncoder().encode(' '.repeat(5000))); c.close(); } });
    assert.equal((await api.post(new Request(origin + '/api/leads', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Lead-Token': token }, body: stream, duplex: 'half' }))).status, 413);
  });
  await test('falha e timeout do Supabase não confirmam nem expõem exceções', async () => {
    fetcher = async () => { throw Error('private-database-detail'); };
    let response = await api.post(request()); assert.equal(response.status, 502); assert.deepEqual(await response.json(), { ok: false, message: leadErrorMessage });
    fetcher = async () => { throw new DOMException('private detail', 'TimeoutError'); };
    response = await api.post(request()); assert.equal(response.status, 504);
  });
  await test('Supabase rejeita: 409/4xx/5xx e respostas inesperadas nunca confirmam', async () => {
    for (const status of [200, 202, 400, 401, 403, 409, 500]) {
      fetcher = async () => Response.json({ detail: 'private-personal-data' }, { status });
      const response = await api.post(request()); assert.equal(response.status, 502); assert.equal((await response.text()).includes('private'), false);
    }
    fetcher = async () => new Response(null, { status: 204 }); assert.equal((await api.post(request())).status, 201);
  });
  await test('configuração ausente ou URL insegura falha fechada sem fetch', async () => {
    for (const badEnv of [{}, { ...env, SUPABASE_URL: 'http://unsafe.example.invalid' }, { ...env, SUPABASE_SECRET_KEY: '' }]) {
      const bad = createLeadHandlers({ env: () => badEnv }); assert.equal((await bad.post(request())).status, 503); assert.equal((await bad.token(new Request(origin + '/api/leads/token'))).status, 503);
    }
  });
} catch (error) { results.push({ pass: false, error: String(error) }); process.exitCode = 1; }
finally {
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ output, total: results.length, passed: results.filter(r => r.pass).length, failed: results.filter(r => !r.pass) }));
}
