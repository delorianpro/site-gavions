import { writeFile } from "node:fs/promises";
import { openHarness, sleep } from "./browser.mjs";
import { outputDir } from "./config.mjs";
import { assertStructuredData } from "./structured-data.mjs";
const output = outputDir("page");
const harness = await openHarness(output);
const checks = [], views = [];
const expectedTitle = "Gavions | Monitoramento inteligente de câmeras com IA";
const expectedDescription = "Proteja empresas, galpões, lojas ou obras com monitoramento de câmeras por IA, detecção de invasões, alertas pelo WhatsApp e acionamento automático de sirenes e refletores.";
const expectedImage = "https://www.gavions.com/assets/img/og-image.png";
const expectedImageAlt = "Gavions: ilustração de uma pessoa detectada no portão, sirene acionada e notificação de alerta no celular.";
let failed;
function check(name, pass) { checks.push({ name, pass: Boolean(pass) }); if (!pass)
    throw new Error(name); }
try {
    for (const width of [1440, 1024, 980, 979, 768, 390, 380, 320]) {
        const session = await harness.createPage(`page-${width}`, { width, reduced: true, readOnly: true });
        // picture may choose a source with its own intrinsic dimensions. Hidden
        // campaign artwork is not fetched at mobile breakpoints by Chromium.
        await harness.evaluate(session, `Promise.all([...document.images].filter(e=>e.getBoundingClientRect().width>0).map(e=>e.decode().catch(()=>{})))`);
        const state = await harness.evaluate(session, `({width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),images:[...document.images].map(e=>{const r=e.getBoundingClientRect();const source=e.parentElement?.tagName==='PICTURE'?[...e.parentElement.querySelectorAll('source')].find(s=>(!s.media||matchMedia(s.media).matches)&&s.srcset):null;const dimensions=source?.hasAttribute('width')?source:e;return{src:e.getAttribute('src'),alt:e.alt,complete:e.complete,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,width:r.width,height:r.height,attributeWidth:+dimensions.getAttribute('width'),attributeHeight:+dimensions.getAttribute('height')}})})`);
        views.push(state);
        check(`Recursos e proporções ${width}`, state.images.every(image => (!image.width && !image.height) || (image.complete && image.naturalWidth > 0 && image.attributeWidth === image.naturalWidth && image.attributeHeight === image.naturalHeight && (!image.height || Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) < .02))));
        check(`Sem rolagem horizontal ${width}`, state.overflow === 0);
        await harness.screenshot(session, `viewport-${width}.png`);
        if (width === 1440) {
            const seo = await harness.evaluate(session, `({lang:document.documentElement.lang,title:document.title,titles:[...document.querySelectorAll('title')].map(e=>e.textContent),descriptions:[...document.querySelectorAll('meta[name="description"]')].map(e=>e.content),social:[...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')].map(e=>({name:e.getAttribute('property')||e.name,content:e.content})),h1:document.querySelectorAll('h1').length,sections:document.querySelectorAll('main > section').length,canonical:[...document.querySelectorAll('link[rel=canonical]')].map(e=>e.getAttribute('href')),ids:[...document.querySelectorAll('[id]')].map(e=>e.id),missingAlt:[...document.images].some(e=>!e.hasAttribute('alt')),jsonld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)),scripts:[...document.scripts].filter(e=>e.src&&!e.src.startsWith(location.origin+'/')).length})`);
            check("Idioma e estrutura da landing page", seo.lang === "pt-BR" && seo.title.startsWith("Gavions") && seo.h1 === 1 && seo.sections === 15);
            assertStructuredData(seo.jsonld);
            check("Grafo JSON-LD correto após hidratação", true);
            check("Canonical única da home no domínio oficial", seo.canonical.length === 1 && new URL(seo.canonical[0]).href === new URL("https://www.gavions.com/").href);
            check("Title único e exato", seo.titles.length === 1 && seo.titles[0] === expectedTitle);
            check("Meta description única e exata", seo.descriptions.length === 1 && seo.descriptions[0] === expectedDescription);
            const social = Object.fromEntries(seo.social.map(tag => [tag.name, tag.content]));
            const expectedSocial = {
                "og:title": expectedTitle, "og:description": expectedDescription,
                "og:site_name": "Gavions", "og:type": "website", "og:locale": "pt_BR",
                "og:image": expectedImage, "og:image:width": "1200", "og:image:height": "630",
                "og:image:type": "image/png", "og:image:alt": expectedImageAlt,
                "twitter:card": "summary_large_image", "twitter:title": expectedTitle,
                "twitter:description": expectedDescription, "twitter:image": expectedImage,
                "twitter:image:alt": expectedImageAlt,
            };
            check("Open Graph e Twitter completos, sem duplicações", Object.entries(expectedSocial).every(([name, content]) => social[name] === content) && new Set(seo.social.map(tag => tag.name)).size === seo.social.length);
            check("og:url e canonical equivalentes no domínio oficial", Boolean(social["og:url"]) && new URL(social["og:url"]).href === new URL(seo.canonical[0]).href);
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
    assertStructuredData(await harness.evaluate(noJs, `[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent))`));
    check("JSON-LD completo e único com JavaScript desativado", true);
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
