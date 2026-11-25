import { openHarness, sleep } from './browser.mjs';
import { writeFile } from 'node:fs/promises';
import { outputDir, referenceDir } from './config.mjs';
if (!referenceDir)
    throw new Error('Comparação visual requer QA_REFERENCE_DIR.');
const h = await openHarness(outputDir('visual'));
const results = [];
let failed;
const roots = `(()=>{const box=e=>{const r=e.getBoundingClientRect();return{id:e.id,tag:e.tagName,x:r.x,y:r.y+scrollY,w:r.width,h:r.height}};return{roots:[document.querySelector('[data-header]'),...document.querySelectorAll('main > section'),document.querySelector('footer')].map(box),overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),images:[...document.images].map(e=>({src:e.getAttribute('src'),complete:e.complete,naturalWidth:e.naturalWidth})),brokenUses:[...document.querySelectorAll('use[href^="#"]')].filter(e=>!document.getElementById(e.getAttribute('href').slice(1))).length}})()`;
try {
    for (const width of [1440, 1024, 768, 390, 320]) {
        const pair = { width };
        for (const original of [true, false]) {
            const label = original ? 'original' : 'next';
            const s = await h.createPage(label + '-' + width, { original, width, height: 1000, reduced: true });
            await h.evaluate(s, `(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,20))}scrollTo({top:0,behavior:'instant'})})()`);
            await sleep(200);
            pair[label] = await h.evaluate(s, roots);
            await h.screenshot(s, label + '-' + width + '-viewport.png');
            await h.screenshot(s, label + '-' + width + '-full.png', true);
            if ([1440, 768, 390].includes(width)) {
                pair[label].phones = [];
                for (const id of ['inicio', 'cameras', 'alertas', 'protecao', 'imoveis']) {
                    await h.evaluate(s, `document.getElementById('t-${id}').click()`);
                    await sleep(80);
                    await h.evaluate(s, `document.querySelector('#p-${id} [data-phone],#p-${id} .phone').scrollIntoView({block:'center',behavior:'instant'})`);
                    await sleep(100);
                    const phone = await h.evaluate(s, `(()=>{const e=document.querySelector('#p-${id} [data-phone],#p-${id} .phone'),r=e.getBoundingClientRect(),back=e.querySelector('use[href="#i-back"]')?.parentElement.parentElement;return{id:'${id}',x:r.x,y:r.y,w:r.width,h:r.height,back:back?{color:getComputedStyle(back).color,background:getComputedStyle(back).backgroundColor}:null}})()`);
                    pair[label].phones.push(phone);
                    await h.screenshot(s, label + '-' + width + '-phone-' + id + '.png');
                }
            }
            await h.send('Page.close', {}, s);
        }
        pair.differences = [];
        for (let i = 0; i < pair.original.roots.length; i++) {
            const a = pair.original.roots[i], b = pair.next.roots[i];
            for (const k of ['x', 'y', 'w', 'h'])
                if (Math.abs(a[k] - b[k]) > .1)
                    pair.differences.push({ id: a.id || a.tag, key: k, original: a[k], next: b[k] });
        }
        if (pair.original.phones)
            for (let i = 0; i < 5; i++) {
                const a = pair.original.phones[i], b = pair.next.phones[i];
                if (['x', 'y', 'w', 'h'].some(k => Math.abs(a[k] - b[k]) > .1))
                    pair.differences.push({ phone: a.id, original: a, next: b });
            }
        results.push(pair);
        console.log(JSON.stringify({ width, differences: pair.differences.length, overflow: pair.next.overflow, brokenUses: pair.next.brokenUses }));
        if (pair.differences.length || pair.next.overflow || pair.next.brokenUses)
            throw Error('Visual difference ' + width);
    }
}
catch (e) {
    failed = String(e);
    console.log(failed);
}
finally {
    await writeFile(h.output + '/report.json', JSON.stringify({ results, failed, logs: h.logs }, null, 2));
    await h.stop();
}
if (failed)
    process.exitCode = 1;
