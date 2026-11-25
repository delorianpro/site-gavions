import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { projectRoot, outputDir } from "./config.mjs";

const require = createRequire(import.meta.url);
const ts = require(path.join(projectRoot, "node_modules/typescript"));
const source = ts.transpileModule(readFileSync(path.join(projectRoot, "lib/black-friday.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const output = outputDir("black-friday");
const results = [];

// Relógio e eventos isolados: nenhum temporizador ou configuração real é alterado.
function visitor(initialNow) {
  const intervals = new Map(), events = new Map(), api = {};
  let now = initialNow, sequence = 0;
  class FakeDate extends Date { static now() { return now; } }
  vm.runInNewContext(source, {
    exports: api,
    Date: FakeDate,
    window: {
      setInterval: (fn, delay) => { const id = ++sequence; intervals.set(id, { fn, delay }); return id; },
      clearInterval: id => intervals.delete(id),
    },
    document: {
      addEventListener: (type, fn) => events.set(type, fn),
      removeEventListener: (type, fn) => { if (events.get(type) === fn) events.delete(type); },
    },
  });
  return {
    api, intervals, events,
    tick: timestamp => { now = timestamp; for (const timer of [...intervals.values()]) timer.fn(); },
    resume: timestamp => { now = timestamp; events.get("visibilitychange")?.(); },
  };
}

function test(name, run) {
  try { run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, error: String(error) }); }
}

const start = Date.parse("2026-11-25T17:00:00-03:00");
const end = Date.parse("2026-12-05T17:00:00-03:00");
const { api } = visitor(start);

test("Configuração oficial: dez dias e fuso explícito de Brasília", () => {
  assert.equal(api.blackFridayCampaign.endsAt, "2026-12-05T17:00:00-03:00");
  assert.equal(end - api.blackFridayCampaign.durationHours * 3600000, start);
  assert.equal(end, Date.parse("2026-12-05T20:00:00Z"));
});

for (const [name, now, expected] of [
  ["Antes do início", start - 86400000, "240:00:00"],
  ["Um milissegundo antes do início", start - 1, "240:00:00"],
  ["Início oficial", start, "240:00:00"],
  ["Primeiro segundo", start + 1000, "239:59:59"],
  ["Duas posições significativas nas horas", end - 99 * 3600000, "099:00:00"],
  ["Uma posição significativa nas horas", end - 9 * 3600000, "009:00:00"],
  ["Troca de minuto", end - 60000, "000:01:00"],
  ["Último milissegundo", end - 1, "000:00:01"],
  ["Encerramento exato", end, "000:00:00"],
  ["Após o encerramento", end + 86400000, "000:00:00"],
]) {
  test(name, () => assert.equal(api.formatBlackFridayCountdown(api.getBlackFridayRemainingSeconds(now)).time, expected));
}

test("Uma assinatura do relógio para desktop e mobile, sem notificações redundantes", () => {
  const v = visitor(start - 2000);
  let calls = 0;
  const first = v.api.blackFridayClock.subscribe(() => calls++);
  const second = v.api.blackFridayClock.subscribe(() => calls++);
  assert.equal(v.intervals.size, 1);
  assert.equal([...v.intervals.values()][0].delay, 1000);
  const initialCalls = calls;
  v.tick(start - 1000);
  v.tick(start);
  assert.equal(calls, initialCalls);
  v.tick(start + 1000);
  assert.equal(calls, initialCalls + 2);
  assert.equal(v.api.blackFridayClock.getSnapshot(), 863999);
  first();
  assert.equal(v.intervals.size, 1);
  second();
  assert.equal(v.intervals.size, 0);
  assert.equal(v.events.size, 0);
});

test("Recarga, outro visitante e retorno de aba usam o mesmo prazo absoluto", () => {
  const now = start + 123456000;
  const v = visitor(start);
  const stop = v.api.blackFridayClock.subscribe(() => {});
  v.resume(now);
  const reloaded = visitor(now);
  const stopReloaded = reloaded.api.blackFridayClock.subscribe(() => {});
  assert.equal(v.api.blackFridayClock.getSnapshot(), reloaded.api.blackFridayClock.getSnapshot());
  assert.equal(v.api.blackFridayClock.getSnapshot(), api.getBlackFridayRemainingSeconds(now));
  stop(); stopReloaded();
});

test("Intervalo encerra em zero e não é criado para visitantes após o prazo", () => {
  const v = visitor(end - 1000);
  const stop = v.api.blackFridayClock.subscribe(() => {});
  v.tick(end);
  assert.equal(v.api.blackFridayClock.getSnapshot(), 0);
  assert.equal(v.intervals.size, 0);
  assert.equal(v.events.size, 0);
  v.tick(end + 60000);
  assert.equal(v.api.blackFridayClock.getSnapshot(), 0);
  stop();
  const expired = visitor(end + 1000);
  const stopExpired = expired.api.blackFridayClock.subscribe(() => {});
  assert.equal(expired.api.blackFridayClock.getSnapshot(), 0);
  assert.equal(expired.intervals.size, 0);
  stopExpired();
});

test("Desmontagem e remontagem, inclusive Strict Mode, limpam o intervalo", () => {
  const v = visitor(start);
  const stop = v.api.blackFridayClock.subscribe(() => {});
  stop();
  v.tick(start + 5000);
  const stopAgain = v.api.blackFridayClock.subscribe(() => {});
  assert.equal(v.intervals.size, 1);
  assert.equal(v.api.blackFridayClock.getSnapshot(), 863995);
  stopAgain();
  assert.equal(v.intervals.size, 0);
  assert.equal(v.events.size, 0);
});

test("HTML inicial determinístico antes, durante e depois da campanha", () => {
  for (const now of [start - 1000, start + 1000, end + 1000]) {
    assert.equal(visitor(now).api.blackFridayClock.getServerSnapshot(), null);
  }
});

writeFileSync(path.join(output, "report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ output, total: results.length, passed: results.filter(r => r.pass).length, failed: results.filter(r => !r.pass) }));
if (results.some(r => !r.pass)) process.exitCode = 1;
