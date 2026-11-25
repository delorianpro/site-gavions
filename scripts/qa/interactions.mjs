import { openHarness, sleep } from './browser.mjs';
import { writeFile } from 'node:fs/promises';
import { outputDir, referenceDir } from './config.mjs';
const h = await openHarness(outputDir('interactions'));
const modes = referenceDir ? [true, false] : [false];
const targets = referenceDir ? ['original', 'next'] : ['next'];
if (!referenceDir)
    console.log('Comparações com HTML original omitidas: configure QA_REFERENCE_DIR.');
const results = [];
let failed;
function check(name, condition, details) { results.push({ name, pass: !!condition, details }); console.log(JSON.stringify(results.at(-1))); if (!condition)
    throw new Error(name + ': ' + JSON.stringify(details)); }
const stateCode = `(()=>{const sim=document.querySelector('[data-sim-cam]').parentElement.parentElement;const lis=[...sim.querySelectorAll('[data-sim-steps] > li')];return {stage:sim.getAttribute('data-stage'),active:lis.filter(li=>[...li.classList].some(c=>c==='on'||c.endsWith('_on'))).length,siren:[...sim.classList].some(c=>c==='siren'||c.endsWith('_siren')),lit:[...sim.classList].some(c=>c==='lit'||c.endsWith('_lit')),clock:sim.querySelector('[data-sim-clock]').textContent,time:performance.now()}})()`;
const getState = sid => h.evaluate(sid, stateCode);
try {
    const next = await h.createPage('next');
    for (const y of [0, 8, 9, 8, 0]) {
        await h.evaluate(next, `window.scrollTo({top:${y},behavior:'instant'})`);
        await sleep(130);
        const actual = await h.evaluate(next, `({y:scrollY,scrolled:document.querySelector('[data-header]').hasAttribute('data-scrolled')})`);
        check('header threshold ' + y, actual.y === y && actual.scrolled === (y > 8), actual);
    }
    const revealBefore = await h.evaluate(next, `({pending:document.querySelectorAll('[data-reveal-state="pending"]').length,visible:document.querySelectorAll('[data-reveal-state="visible"]').length,delays:[...document.querySelectorAll('#problema article')].map(e=>getComputedStyle(e).transitionDelay)})`);
    check('reveal initially enhanced and staggered', revealBefore.pending > 0 && JSON.stringify(revealBefore.delays) === JSON.stringify(['0s', '0.07s', '0.14s', '0.21s']), revealBefore);
    await h.evaluate(next, `document.getElementById('problema').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(1000);
    const revealed = await h.evaluate(next, `[...document.querySelectorAll('#problema [data-reveal-state]')].every(e=>e.dataset.revealState==='visible'&&getComputedStyle(e).opacity==='1')`);
    check('reveal enters once visible', revealed);
    await h.evaluate(next, `window.scrollTo({top:0,behavior:'instant'})`);
    await sleep(150);
    check('revealed items stay revealed', await h.evaluate(next, `[...document.querySelectorAll('#problema [data-reveal-state]')].every(e=>e.dataset.revealState==='visible')`));
    await h.evaluate(next, `document.getElementById('app').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(700);
    const ids = ['inicio', 'cameras', 'alertas', 'protecao', 'imoveis'];
    for (const id of ids) {
        await h.evaluate(next, `document.getElementById('t-${id}').click()`);
        await sleep(100);
        const tab = await h.evaluate(next, `({selected:[...document.querySelectorAll('[role="tab"][aria-selected="true"]')].map(t=>t.id),visible:[...document.querySelectorAll('[role="tabpanel"]')].filter(p=>!p.hidden).map(p=>p.id),stops:[...document.querySelectorAll('[role="tab"]')].filter(t=>t.tabIndex===0).map(t=>t.id),controls:document.getElementById('t-${id}').getAttribute('aria-controls'),label:document.getElementById('p-${id}').getAttribute('aria-labelledby')})`);
        check('tab click ' + id, JSON.stringify(tab.selected) === JSON.stringify(['t-' + id]) && JSON.stringify(tab.visible) === JSON.stringify(['p-' + id]) && JSON.stringify(tab.stops) === JSON.stringify(['t-' + id]) && tab.controls === 'p-' + id && tab.label === 't-' + id, tab);
    }
    await h.evaluate(next, `document.getElementById('t-inicio').focus()`);
    for (const [key, expected] of [['ArrowRight', 'cameras'], ['ArrowRight', 'alertas'], ['ArrowRight', 'protecao'], ['ArrowRight', 'imoveis'], ['ArrowRight', 'inicio'], ['ArrowLeft', 'imoveis'], ['Home', 'inicio'], ['End', 'imoveis']]) {
        await h.send('Input.dispatchKeyEvent', { type: 'keyDown', key }, next);
        await h.send('Input.dispatchKeyEvent', { type: 'keyUp', key }, next);
        await sleep(90);
        const focus = await h.evaluate(next, `({focus:document.activeElement.id,selected:document.querySelector('[role="tab"][aria-selected="true"]').id})`);
        check('tab keyboard ' + key + ' -> ' + expected, focus.focus === 't-' + expected && focus.selected === 't-' + expected, focus);
    }
    const mobile = await h.createPage('mobile', { width: 390, height: 844 });
    const cta = () => h.evaluate(mobile, `(()=>{const e=document.querySelector('[data-mobile-cta]');return {hidden:e.getAttribute('aria-hidden'),inert:e.inert,tabIndex:e.querySelector('a').tabIndex,transform:getComputedStyle(e).transform,display:getComputedStyle(e).display,waHidden:document.querySelector('[data-wa-float]').hidden}})()`);
    check('mobile CTA initially hidden', (await cta()).inert === true, await cta());
    await h.evaluate(mobile, `document.getElementById('problema').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(600);
    const shown = await cta();
    check('mobile CTA shown after hero', shown.hidden === 'false' && !shown.inert && shown.tabIndex === 0 && shown.waHidden, shown);
    await h.evaluate(mobile, `document.querySelector('[data-mobile-cta] a').focus();document.getElementById('demonstracao').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(600);
    const hidden = await cta();
    check('mobile CTA hidden near demo and cannot retain focus', hidden.hidden === 'true' && hidden.inert && hidden.tabIndex === -1 && await h.evaluate(mobile, `!document.querySelector('[data-mobile-cta]').contains(document.activeElement)`), hidden);
    await h.evaluate(mobile, `document.getElementById('problema').scrollIntoView({block:'start',behavior:'instant'})`);
    await sleep(350);
    for (const width of [768, 767, 1024]) {
        await h.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false }, mobile);
        await sleep(350);
        const c = await cta();
        check('CTA breakpoint ' + width, width >= 768 ? c.inert && c.display === 'none' : !c.inert && c.display !== 'none', c);
    }
    await h.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false }, mobile);
    await h.evaluate(mobile, `document.getElementById('app').scrollIntoView({block:'start',behavior:'instant'});document.getElementById('t-inicio').focus()`);
    await sleep(200);
    await h.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End' }, mobile);
    await h.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'End' }, mobile);
    await sleep(900);
    const horizontal = await h.evaluate(mobile, `(()=>{const t=document.getElementById('t-imoveis'),list=t.parentElement,r=t.getBoundingClientRect(),p=list.getBoundingClientRect();return {selected:t.getAttribute('aria-selected'),scrollLeft:list.scrollLeft,left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right}})()`);
    check('mobile tabs scroll selected tab into view', horizontal.selected === 'true' && horizontal.scrollLeft > 0 && horizontal.left >= horizontal.parentLeft - 1 && horizontal.right <= horizontal.parentRight + 1, horizontal);
    await h.evaluate(mobile, `document.getElementById('perguntas').scrollIntoView({block:'start',behavior:'instant'});document.querySelector('#perguntas summary').click()`);
    await sleep(150);
    check('native FAQ opens', await h.evaluate(mobile, `document.querySelector('#perguntas details').open`));
    check('form submission guard retained', await h.evaluate(mobile, `(()=>{const e=new Event('submit',{bubbles:true,cancelable:true});document.querySelector('[data-lead-form]').dispatchEvent(e);return e.defaultPrevented})()`));
    check('no tracking or commercial endpoint installed', await h.evaluate(mobile, `typeof window.gtag==='undefined'&&typeof window.fbq==='undefined'&&typeof window.dataLayer==='undefined'&&[...document.scripts].filter(s=>s.src).every(s=>s.src.startsWith(location.origin+'/'))`));
    // Fresh pages exercise automatic visibility start before using replay.
    const timing = {};
    for (const label of targets) {
        const sid = await h.createPage(label + '-timeline', { original: label === 'original' });
        check(label + ' simulation idle off screen', (await getState(sid)).stage === null, await getState(sid));
        await h.evaluate(sid, `document.querySelector('[data-sim-cam]').scrollIntoView({block:'center',behavior:'instant'})`);
        await sleep(180);
        check(label + ' simulation automatic start', (await getState(sid)).stage === '0', await getState(sid));
        const observer = await h.evaluate(sid, `window.__qa.observers.find(o=>o.options?.threshold===0.4)`);
        check(label + ' original observer threshold', observer?.options.threshold === 0.4, observer?.options);
        await h.evaluate(sid, `window.__qa.timerEvents=[];window.__qa.start=performance.now();document.querySelector('[data-sim-replay]').click()`);
        const samples = [];
        let last = 0;
        for (const ms of [200, 1800, 2400, 3000, 3600, 4200, 4800, 9300]) {
            await sleep(ms - last);
            last = ms;
            const state = await getState(sid);
            samples.push({ ms, ...state });
            const count = ms < 1700 ? 0 : ms < 2300 ? 1 : ms < 2900 ? 2 : ms < 3500 ? 3 : ms < 4100 ? 4 : ms < 4700 ? 5 : 6;
            check(label + ' simulation at ' + ms, state.active === count && state.siren === (ms >= 2300 && ms < 9000) && state.lit === (ms >= 2900), state);
        }
        const events = await h.evaluate(sid, `window.__qa.timerEvents.map(e=>({delay:e.delay,elapsed:e.time-window.__qa.start}))`);
        check(label + ' all sequence delays', JSON.stringify(events.map(e => e.delay)) === JSON.stringify([30, 1700, 2300, 2900, 3500, 4100, 4700, 9000]), events);
        const stopped = await getState(sid);
        await sleep(1100);
        check(label + ' clock stops after nine seconds', (await getState(sid)).clock === stopped.clock, { clock: stopped.clock });
        timing[label] = { samples, events };
        await h.screenshot(sid, label + '-simulation-complete.png');
    }
    await writeFile(h.output + '/timing.json', JSON.stringify(timing, null, 2));
    const replay = await h.createPage('replay');
    await h.evaluate(replay, `document.querySelector('[data-sim-cam]').scrollIntoView({block:'center',behavior:'instant'})`);
    await sleep(2500);
    await h.evaluate(replay, `document.querySelector('[data-sim-replay]').click()`);
    await sleep(200);
    check('replay resets state and clock', (await getState(replay)).active === 0 && (await getState(replay)).clock === '02:14:05', await getState(replay));
    await sleep(2300);
    await h.evaluate(replay, `document.querySelector('[data-sim-replay]').click()`);
    await sleep(7000);
    check('replay cancels old end timer', (await getState(replay)).siren === true, await getState(replay));
    await sleep(2200);
    check('replayed simulation finishes', (await getState(replay)).siren === false && (await getState(replay)).active === 6, await getState(replay));
    await h.evaluate(replay, `document.querySelector('[data-sim-replay]').click()`);
    await sleep(2400);
    await h.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, replay);
    await sleep(200);
    const reduced = await getState(replay);
    check('live reduced motion completes without flashing', reduced.stage === '6' && reduced.active === 6 && !reduced.siren && reduced.lit && reduced.clock === '02:14:09', reduced);
    const timers = await h.evaluate(replay, `({intervals:window.__qa.activeIntervals,timers:window.__qa.activeTimers,pending:document.querySelectorAll('[data-reveal-state="pending"]').length,scroll:getComputedStyle(document.documentElement).scrollBehavior})`);
    check('motion change cleans timers and shows reveal content', Object.keys(timers.intervals).length === 0 && Object.keys(timers.timers).length === 0 && timers.pending === 0 && timers.scroll === 'auto', timers);
    for (const original of modes) {
        const sid = await h.createPage((original ? 'original' : 'next') + '-reduced', { original, reduced: true });
        await h.evaluate(sid, `document.querySelector('[data-sim-cam]').scrollIntoView({block:'center',behavior:'instant'})`);
        await sleep(200);
        const s = await getState(sid);
        check((original ? 'original' : 'next') + ' reduced on load', s.stage === '6' && s.active === 6 && !s.siren && s.clock === '02:14:09', s);
    }
    const unsupported = await h.createPage('no-observer', { noObserver: true });
    await sleep(300);
    check('observer unavailable: content visible and simulation runs', await h.evaluate(unsupported, `document.querySelectorAll('[data-reveal-state="pending"]').length===0`) && (await getState(unsupported)).stage === '0', await getState(unsupported));
    for (const original of modes) {
        const sid = await h.createPage((original ? 'original' : 'next') + '-no-js', { original, jsDisabled: true, width: 390, height: 844 });
        const staticPage = await h.evaluate(sid, `({sections:document.querySelectorAll('main > section').length,headings:[...document.querySelectorAll('main > section h2')].filter(e=>getComputedStyle(e).opacity==='0').length,pending:document.querySelectorAll('[data-reveal-state="pending"]').length,panels:[...document.querySelectorAll('[role="tabpanel"]')].filter(e=>!e.hidden).map(e=>e.id),ctaInert:document.querySelector('[data-mobile-cta]').inert,formSteps:[...document.querySelectorAll('[data-form-step]')].filter(e=>!e.hidden).length,scrollWidth:document.documentElement.scrollWidth,width:innerWidth})`);
        check((original ? 'original' : 'next') + ' no-JS content available', staticPage.sections === 15 && staticPage.pending === 0 && staticPage.headings === 0 && staticPage.panels[0] === 'p-inicio' && staticPage.scrollWidth <= staticPage.width, staticPage);
        if (!original)
            check('no-JS CTA not focusable', staticPage.ctaInert, staticPage);
        await h.evaluate(sid, `document.querySelector('#perguntas summary').click()`);
        check((original ? 'original' : 'next') + ' no-JS native FAQ', await h.evaluate(sid, `document.querySelector('#perguntas details').open`));
        await h.screenshot(sid, (original ? 'original' : 'next') + '-no-js.png', true);
    }
    check('no application console/hydration errors', h.logs.errors.length === 0 && !h.logs.console.some(e => e.type === 'error'), h.logs);
    check('no resource failures or commercial requests', h.logs.httpErrors.length === 0 && h.logs.blocked.length === 0, { http: h.logs.httpErrors, blocked: h.logs.blocked });
}
catch (error) {
    failed = String(error);
    console.log(failed);
}
finally {
    await writeFile(h.output + '/report.json', JSON.stringify({ results, failed, logs: h.logs }, null, 2));
    await h.stop();
}
if (failed)
    process.exitCode = 1;
