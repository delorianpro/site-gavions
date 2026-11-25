import { writeFile } from "node:fs/promises";
import { openHarness, sleep } from "./browser.mjs";
import { outputDir } from "./config.mjs";
const output = outputDir("simulation");
const harness = await openHarness(output);
const measurements = [];
const measureOnly = process.argv.includes("--measure-only");
let failed;
async function pixels(session, background, foreground, boxes) {
    return harness.evaluate(session, `(async()=>{
    const decode=async data=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0);return {width:canvas.width,height:canvas.height,data:context.getImageData(0,0,canvas.width,canvas.height).data}};
    const bg=await decode(${JSON.stringify(background)}),fg=await decode(${JSON.stringify(foreground)});
    const at=(image,x,y)=>Array.from(image.data.slice((y*image.width+x)*4,(y*image.width+x)*4+3));
    const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    return ${JSON.stringify(boxes)}.map(box=>{
      if(box.x<0||box.y<0||box.x+box.w>bg.width||box.y+box.h>bg.height)throw Error('Texto fora da área amostrada');
      const ink=at(fg,Math.floor(box.x+2),Math.floor(box.y+2)),inkLum=luminance(ink);let minimum=Infinity,maximum=0,darkest,lightest;
      for(let y=Math.ceil(box.y+1);y<Math.floor(box.y+box.h-1);y++)for(let x=Math.ceil(box.x+1);x<Math.floor(box.x+box.w-1);x++){
        const color=at(bg,x,y),lum=luminance(color),ratio=(Math.max(lum,inkLum)+.05)/(Math.min(lum,inkLum)+.05);
        if(ratio<minimum){minimum=ratio;lightest=color}if(ratio>maximum){maximum=ratio;darkest=color}
      }
      return {...box,foreground:ink,backgroundAtMinimum:lightest,backgroundAtMaximum:darkest,minimum,maximum};
    });
  })()`);
}
async function contrast(session) {
    const boxes = await harness.evaluate(session, `(()=>{
    const texts=[...document.querySelectorAll('[data-sim-steps] h3,[data-sim-steps] p')];
    window.__contrastRestore=texts.map(el=>({el,style:el.getAttribute('style')}));
    return texts.map((el,index)=>{const r=el.getBoundingClientRect(),color=getComputedStyle(el).color;
      el.style.setProperty('-webkit-text-fill-color','transparent','important');el.style.position='relative';
      return {index,tag:el.tagName,step:Math.floor(index/2),text:el.textContent,x:r.x,y:r.y,w:r.width,h:r.height,color};});
  })()`);
    try {
        const background = await harness.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, session);
        await harness.evaluate(session, `window.__contrastRestore.forEach(({el})=>{const probe=document.createElement('span');probe.setAttribute('aria-hidden','true');probe.dataset.qaProbe='';probe.style.cssText='position:absolute;left:0;top:0;width:4px;height:4px;pointer-events:none;background:'+getComputedStyle(el).color;el.append(probe)})`);
        const foreground = await harness.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, session);
        return await pixels(session, background.data, foreground.data, boxes);
    }
    finally {
        await harness.evaluate(session, `window.__contrastRestore.forEach(({el,style})=>{el.querySelector('[data-qa-probe]')?.remove();if(style===null)el.removeAttribute('style');else el.setAttribute('style',style)});delete window.__contrastRestore`);
    }
}
try {
    for (const width of [1440, 768, 390]) {
        const session = await harness.createPage(`contrast-${width}`, { width, height: 1800, freezeSimulation: true });
        await harness.evaluate(session, `document.querySelector('[data-sim-steps]').scrollIntoView({block:'center',behavior:'instant'})`);
        await sleep(800);
        let previous = 0;
        for (const [name, time, completed] of [["pending", 100, 0], ["active-1", 1800, 1], ["active-3", 3000, 3], ["completed", 9500, 6]]) {
            await harness.evaluate(session, `window.__qa.advanceSimulation(${time - previous})`);
            previous = time;
            await sleep(550);
            const state = await harness.evaluate(session, `({stage:document.querySelector('[data-sim-enhanced]').getAttribute('data-stage'),completed:[...document.querySelector('[data-sim-steps]').children].filter(e=>[...e.classList].some(c=>c.endsWith('_on'))).length,intervals:Object.keys(window.__qa.activeIntervals).length})`);
            if (state.completed !== completed)
                throw new Error(`Sequência divergente: ${name}`);
            await harness.screenshot(session, `${width}-${name}.png`);
            const text = await contrast(session);
            const minimum = Math.min(...text.map(item => item.minimum));
            measurements.push({ width, name, time, state, minimum, text });
            if (!measureOnly && minimum < 4.5)
                throw new Error(`Contraste menor que 4,5:1 em ${width}/${name}: ${minimum.toFixed(2)}`);
        }
        await harness.evaluate(session, `document.querySelector('[data-sim-replay]').click();window.__qa.advanceSimulation(100)`);
        await sleep(500);
        const replay = await contrast(session);
        if (!measureOnly && replay.some(item => item.minimum < 4.5))
            throw new Error("Contraste insuficiente no replay");
        await harness.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }, session);
        await sleep(500);
        const reduced = await harness.evaluate(session, `({completed:[...document.querySelector('[data-sim-steps]').children].filter(e=>[...e.classList].some(c=>c.endsWith('_on'))).length,timers:Object.keys(window.__qa.activeTimers).length,intervals:Object.keys(window.__qa.activeIntervals).length})`);
        if (reduced.completed !== 6 || reduced.timers || reduced.intervals)
            throw new Error("Movimento reduzido não concluiu/limpou a execução.");
        await harness.screenshot(session, `${width}-reduced-motion.png`);
        const text = await contrast(session);
        measurements.push({ width, name: "reduced-motion", state: reduced, minimum: Math.min(...text.map(item => item.minimum)), text });
        if (!measureOnly && text.some(item => item.minimum < 4.5))
            throw new Error("Contraste insuficiente com movimento reduzido");
        await harness.send("Page.close", {}, session);
    }
    if (harness.logs.errors.length || harness.logs.console.length || harness.logs.blocked.length || harness.logs.httpErrors.length)
        throw new Error("Erro/aviso inesperado no navegador.");
}
catch (error) {
    failed = String(error);
}
finally {
    await writeFile(output + "/report.json", JSON.stringify({ measureOnly, method: "Solid text-color swatches inherit real compositing; background pixels sampled over each full text rectangle, including gradients. Glyph antialiasing is excluded as required for contrast calculation.", measurements, failed, logs: harness.logs }, null, 2));
    await harness.stop();
}
console.log(JSON.stringify({ output, states: measurements.length, minimum: Math.min(...measurements.map(item => item.minimum)), measureOnly, failed }));
if (failed)
    process.exitCode = 1;
