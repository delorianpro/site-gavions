import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot } from './config.mjs';
const require = createRequire(import.meta.url);
// Runs only in Node, never outputs values or network requests.
const { loadEnvConfig } = require(join(projectRoot, 'node_modules/@next/env'));
loadEnvConfig(projectRoot, false, { info() {}, error() {} });
const values = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].map(name => process.env[name]);
assert(values.every(value => typeof value === 'string' && value.length > 0), 'Configuração necessária para auditoria indisponível.');
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const targets = [
  ...files(join(projectRoot, '.next/static')),
  ...files(join(projectRoot, '.next/server/app')).filter(file => /\.(?:html|rsc|txt)$/.test(file)),
];
assert(targets.length > 0, 'Execute o build antes desta auditoria.');
let exposed = false;
for (const target of targets) {
  const data = readFileSync(target);
  if (values.some(value => data.includes(Buffer.from(value))) || data.includes(Buffer.from('SUPABASE_SECRET_KEY')) || data.includes(Buffer.from('SUPABASE_URL'))) exposed = true;
}
assert.equal(exposed, false, 'A auditoria detectou exposição de configuração no conteúdo público.');
console.log(JSON.stringify({ checkedFiles: targets.length, credentialsExposed: exposed, pass: true }));
