import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { openHarness, sleep } from "./browser.mjs";
import { outputDir, projectRoot } from "./config.mjs";
const require = createRequire(projectRoot + "/package.json");
let axePath;
try {
    axePath = require.resolve("axe-core/axe.min.js");
}
catch {
    throw new Error("axe-core não está disponível no tooling instalado. Não será instalado automaticamente.");
}
const axe = await readFile(axePath, "utf8");
const output = outputDir("accessibility");
const harness = await openHarness(output);
const results = [];
let failed;
try {
    for (const width of [1440, 390, 320]) {
        const session = await harness.createPage(`axe-${width}`, { width, reduced: true, freezeSimulation: true });
        await harness.evaluate(session, axe);
        for (const state of ["pending", "completed"]) {
            if (state === "completed") {
                await harness.evaluate(session, "document.querySelector('[data-sim-cam]').scrollIntoView({block:'center',behavior:'instant'})");
                await sleep(200);
            }
            const result = await harness.evaluate(session, `axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length})),passes:r.passes.length}))`);
            results.push({ width, state, ...result });
            if (result.violations.length)
                throw new Error(`Axe encontrou violações em ${width}/${state}.`);
        }
        await harness.send("Page.close", {}, session);
    }
    if (harness.logs.errors.length || harness.logs.console.length)
        throw new Error("Avisos inesperados de console/hidratação.");
}
catch (error) {
    failed = String(error);
}
finally {
    await writeFile(output + "/report.json", JSON.stringify({ results, failed, logs: harness.logs }, null, 2));
    await harness.stop();
}
console.log(JSON.stringify({ output, states: results.length, failed }));
if (failed)
    process.exitCode = 1;
