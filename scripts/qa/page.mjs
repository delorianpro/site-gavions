import { writeFile } from "node:fs/promises";
import { openHarness, sleep } from "./browser.mjs";
import { outputDir } from "./config.mjs";
const output = outputDir("page");
const harness = await openHarness(output);
const checks = [], views = [];
let failed;
function check(name, pass) { checks.push({ name, pass: Boolean(pass) }); if (!pass)
    throw new Error(name); }
try {
    for (const width of [1440, 1024, 980, 979, 768, 390, 380, 320]) {
        const session = await harness.createPage(`page-${width}`, { width, reduced: true, readOnly: true });
        const state = await harness.evaluate(session, `({width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),images:[...document.images].map(e=>{const r=e.getBoundingClientRect();return{src:e.getAttribute('src'),alt:e.alt,complete:e.complete,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,width:r.width,height:r.height,attributeWidth:+e.getAttribute('width'),attributeHeight:+e.getAttribute('height')}})})`);
        views.push(state);
        check(`Recursos e proporções ${width}`, state.images.every(image => image.complete && image.naturalWidth > 0 && image.attributeWidth === image.naturalWidth && image.attributeHeight === image.naturalHeight && (!image.height || Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) < .02)));
        check(`Sem rolagem horizontal ${width}`, state.overflow === 0);
        await harness.screenshot(session, `viewport-${width}.png`);
        if (width === 1440) {
            const seo = await harness.evaluate(session, `({lang:document.documentElement.lang,title:document.title,h1:document.querySelectorAll('h1').length,sections:document.querySelectorAll('main > section').length,canonical:!!document.querySelector('link[rel=canonical]'),ids:[...document.querySelectorAll('[id]')].map(e=>e.id),missingAlt:[...document.images].some(e=>!e.hasAttribute('alt')),jsonld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)),scripts:[...document.scripts].filter(e=>e.src&&!e.src.startsWith(location.origin+'/')).length})`);
            check("HTML inicial, idioma e SEO", seo.lang === "pt-BR" && seo.title.startsWith("Gavions") && seo.h1 === 1 && seo.sections === 15 && !seo.canonical && seo.jsonld[0]?.["@type"] === "Service");
            check("Alt, IDs e ausência de SDK externo", !seo.missingAlt && new Set(seo.ids).size === seo.ids.length && seo.scripts === 0);
            await harness.evaluate(session, "document.activeElement.blur()");
            await harness.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab" }, session);
            await harness.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab" }, session);
            check("Link de pular conteúdo primeiro no teclado", await harness.evaluate(session, "document.activeElement.getAttribute('href')==='#conteudo'"));
        }
        await harness.send("Page.close", {}, session);
    }
    const future = await harness.createPage("future-year", { extraInit: "Date.prototype.getFullYear=()=>2031;", reduced: true, readOnly: true });
    check("Ano futuro sem divergência de hidratação", await harness.evaluate(future, "document.querySelector('[data-year]').textContent==='2031'"));
    const noJs = await harness.createPage("no-js", { jsDisabled: true, reduced: true, readOnly: true });
    check("Sem JS: rascunho não serializa campos", await harness.evaluate(noJs, "new FormData(document.querySelector('[data-lead-form]')).entries().next().done&&document.querySelector('#f-nome').matches(':disabled')"));
    check("Sem JS: fallback original de ano", await harness.evaluate(noJs, "document.querySelector('[data-year]').textContent==='2026'"));
    await sleep(100);
    check("Console sem avisos de imagem, exceções ou hidratação", harness.logs.console.length === 0 && harness.logs.errors.length === 0);
    check("Somente recursos locais carregados", harness.logs.blocked.length === 0 && harness.logs.httpErrors.length === 0);
}
catch (error) {
    failed = String(error);
}
finally {
    await writeFile(output + "/report.json", JSON.stringify({ checks, views, failed, logs: harness.logs }, null, 2));
    await harness.stop();
}
console.log(JSON.stringify({ output, checks: checks.length, passed: checks.filter(check => check.pass).length, failed }));
if (failed)
    process.exitCode = 1;
