import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { baseUrl, outputDir, projectRoot } from "./config.mjs";
import { assertStructuredData } from "./structured-data.mjs";

const output = outputDir("seo");
const checks = [];
async function check(name, run) {
    await run();
    checks.push({ name, pass: true });
}
let failed;
try {
    const response = await fetch(baseUrl + "/", { redirect: "error" });
    assert.equal(response.status, 200);
    const html = await response.text();
    await writeFile(path.join(output, "initial.html"), html);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
        .filter(([, attributes]) => /\btype\s*=\s*["']application\/ld\+json["']/i.test(attributes));
    let graph;
    await check("HTML HTTP inicial contém um único grafo JSON-LD válido, com entidades e referências corretas", () => {
        graph = assertStructuredData(scripts.map(([, , json]) => JSON.parse(json)));
        assert.equal(scripts[0][2].includes("<"), false);
    });
    await writeFile(path.join(output, "rendered.json"), JSON.stringify(graph, null, 2) + "\n");

    await check("Logotipo oficial responde HTTP 200 e corresponde ao PNG real usado na página", async () => {
        const brand = graph["@graph"].find(node => node["@type"] === "Brand");
        const pathname = new URL(brand.logo).pathname;
        assert.ok(html.includes(`src="${pathname}"`));
        const logo = await fetch(new URL(pathname, baseUrl), { redirect: "error" });
        assert.equal(logo.status, 200);
        assert.match(logo.headers.get("content-type"), /^image\/png/);
        const buffer = Buffer.from(await logo.arrayBuffer());
        assert.deepEqual(buffer, await readFile(path.join(projectRoot, "public", pathname)));
        assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
        assert.equal(buffer.readUInt32BE(16), 720);
        assert.equal(buffer.readUInt32BE(20), 116);
    });

    await check("Serialização impede fechamento do script e preserva o conteúdo após JSON.parse", async () => {
        const require = createRequire(import.meta.url);
        const ts = require(path.join(projectRoot, "node_modules/typescript"));
        const compiled = path.join(output, "compiled");
        await mkdir(compiled, { recursive: true });
        for (const file of ["site-config", "structured-data"]) {
            const source = await readFile(path.join(projectRoot, "lib", file + ".ts"), "utf8");
            await writeFile(path.join(compiled, file + ".js"), ts.transpileModule(source, {
                compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
            }).outputText);
        }
        const { homeStructuredData, serializeStructuredData } = require(path.join(compiled, "structured-data.js"));
        assert.deepEqual(homeStructuredData, graph);
        const hostile = structuredClone(homeStructuredData);
        const description = '</script><script>alert("x")</script><!-- & > \u2028\u2029';
        hostile["@graph"].find(node => node["@type"] === "Service").description = description;
        const serialized = serializeStructuredData(hostile);
        assert.equal(serialized.includes("<"), false);
        assert.ok(serialized.includes("\\u003c/script>"));
        assert.deepEqual(JSON.parse(serialized), hostile);
    });
} catch (error) {
    failed = String(error);
    process.exitCode = 1;
} finally {
    await writeFile(path.join(output, "report.json"), JSON.stringify({ checks, failed }, null, 2));
    console.log(JSON.stringify({ output, checks: checks.length, passed: checks.length, failed }));
}
