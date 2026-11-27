import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { openHarness, sleep, waitUntil } from "./browser.mjs";
import { outputDir } from "./config.mjs";

const output = outputDir("back-to-top");
const h = await openHarness(output);
const checks = [];
const selector = 'button[aria-label="Voltar ao topo"]';
const scrollSpy = `window.__scrollCalls=[];{const original=window.scrollTo.bind(window);window.scrollTo=(...args)=>{window.__scrollCalls.push(args[0]);return original(...args)}}`;
const state = sid => h.evaluate(sid, `(()=>{const b=document.querySelector('${selector}');return {y:scrollY,visible:b.hasAttribute('data-visible'),inert:b.inert,tabIndex:b.tabIndex,hidden:b.getAttribute('aria-hidden'),visibility:getComputedStyle(b).visibility}})()`);
function check(name, pass) {
    checks.push({ name, pass: Boolean(pass) });
    assert.ok(pass, name);
}
let failed;
try {
    for (const width of [1440, 390, 320]) {
        const sid = await h.createPage(`back-to-top-${width}`, {
            width, reduced: true, readOnly: true,
            extraInit: scrollSpy,
        });
        let current = await state(sid);
        check(`${width}: oculto e fora do teclado no topo`, !current.visible && current.inert && current.tabIndex === -1 && current.hidden === "true");
        await h.evaluate(sid, "scrollTo({top:400,behavior:'instant'})");
        await sleep(150);
        check(`${width}: permanece oculto no limite de 400px`, !(await state(sid)).visible);
        // Find a clear position using real page content and collision detection.
        let clearPosition = false;
        for (const top of [650, 1000, 1500, 2200]) {
            await h.evaluate(sid, `scrollTo({top:${top},behavior:'instant'})`);
            await sleep(200);
            if ((await state(sid)).visible) { clearPosition = true; break; }
        }
        current = await state(sid);
        check(`${width}: visível e acessível após rolagem em área livre`, clearPosition && !current.inert && current.tabIndex === 0 && current.hidden === "false");
        // Move an already observed real CTA into the footprint only in this test tab.
        await h.evaluate(sid, `(()=>{const b=document.querySelector('${selector}').parentElement.getBoundingClientRect(),a=document.querySelector('[data-track="cta_header"]');window.__originalCtaStyle=a.getAttribute('style');a.style.cssText='position:fixed;z-index:9999;left:'+b.left+'px;top:'+b.top+'px;width:'+b.width+'px;height:'+b.height+'px'})()`);
        await waitUntil(async () => !(await state(sid)).visible, "controle oculto por colisão");
        current = await state(sid);
        check(`${width}: colisão com CTA oculta e desativa o controle`, current.inert && current.tabIndex === -1 && current.hidden === "true");
        await h.evaluate(sid, `(()=>{const a=document.querySelector('[data-track="cta_header"]');if(window.__originalCtaStyle===null)a.removeAttribute('style');else a.setAttribute('style',window.__originalCtaStyle)})()`);
        await waitUntil(async () => (await state(sid)).visible, "controle reaparece sem colisão");
        await h.evaluate(sid, `document.querySelector('${selector}').focus()`);
        check(`${width}: controle recebe foco quando visível`, await h.evaluate(sid, `document.activeElement===document.querySelector('${selector}')`));
        await h.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" }, sid);
        await h.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }, sid);
        await waitUntil(async () => (await state(sid)).y === 0, "retorno ao topo por teclado");
        check(`${width}: ativação por teclado respeita movimento reduzido`, await h.evaluate(sid, "window.__scrollCalls.at(-1).top===0&&window.__scrollCalls.at(-1).behavior==='instant'"));
        await waitUntil(async () => (await state(sid)).inert, "controle desativado no topo");
        check(`${width}: desativado após retorno ao topo`, !(await state(sid)).visible);
        await h.send("Page.close", {}, sid);
    }
    const smooth = await h.createPage("back-to-top-smooth", { readOnly: true, extraInit: scrollSpy });
    await h.evaluate(smooth, "scrollTo({top:650,behavior:'instant'})");
    await waitUntil(async () => (await state(smooth)).visible, "controle visível com movimento normal");
    await h.evaluate(smooth, `document.querySelector('${selector}').click()`);
    check("Movimento normal: solicita rolagem suave", await h.evaluate(smooth, "window.__scrollCalls.at(-1).top===0&&window.__scrollCalls.at(-1).behavior==='smooth'"));
    await waitUntil(async () => (await state(smooth)).y === 0, "retorno suave ao topo");
    check("Movimento normal: conclui retorno ao topo", (await state(smooth)).y === 0);
    const fallback = await h.createPage("back-to-top-no-observer", { noObserver: true, readOnly: true, reduced: true });
    await h.evaluate(fallback, "scrollTo({top:1000,behavior:'instant'})");
    await sleep(200);
    check("Sem IntersectionObserver: controle permanece oculto e inerte", !(await state(fallback)).visible && (await state(fallback)).inert);
    const noJs = await h.createPage("back-to-top-no-js", { jsDisabled: true, readOnly: true, reduced: true });
    check("Sem JavaScript: controle permanece oculto e fora do teclado", (await state(noJs)).inert && (await state(noJs)).tabIndex === -1);
    check("Sem exceções, falhas HTTP ou requisições externas", h.logs.errors.length === 0 && h.logs.console.length === 0 && h.logs.httpErrors.length === 0 && h.logs.blocked.length === 0);
} catch (error) {
    failed = String(error);
    process.exitCode = 1;
} finally {
    await writeFile(output + "/report.json", JSON.stringify({ checks, failed, logs: h.logs }, null, 2));
    await h.stop();
    console.log(JSON.stringify({ output, checks: checks.length, passed: checks.filter(item => item.pass).length, failed }));
}
