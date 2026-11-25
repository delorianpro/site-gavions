import { spawn } from "node:child_process";
import { createServer, get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { baseUrl, chromePath, fakeLeadConfig, referenceDir, safeFixture } from "./config.mjs";
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function waitUntil(condition, message, timeout = 10000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (await condition()) return;
        await sleep(40);
    }
    throw new Error(`Timeout: ${message}`);
}
function readLocalHtml() {
    return new Promise((resolve, reject) => {
        const request = (baseUrl.startsWith("https:") ? httpsGet : httpGet)(baseUrl + "/", response => {
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error("A aplicação local deve responder HTTP 200."));
                return;
            }
            let html = "";
            response.setEncoding("utf8");
            response.on("data", part => { html += part; });
            response.on("end", () => resolve(html));
        });
        request.setTimeout(10000, () => request.destroy(new Error("Timeout lendo HTML local.")));
        request.on("error", reject);
    });
}
// Only the intercepted test response changes. The application and its config stay intact.
function fixtureHtml(html, config) {
    let replaced = false;
    html = html.replace(/self\.__next_f\.push\((\[[\s\S]*?\])\)/g, (script, data) => {
        let entry;
        try {
            entry = JSON.parse(data);
        }
        catch {
            return script;
        }
        if (typeof entry[1] !== "string")
            return script;
        entry[1] = entry[1].replace(/"config":(\{"leadEndpoint":[^\n]*?"responseContract":\{[^}]*\}\})/, () => {
            replaced = true;
            return '"config":' + JSON.stringify(config);
        });
        return "self.__next_f.push(" + JSON.stringify(entry).replace(/</g, "\\u003c") + ")";
    });
    if (!replaced)
        throw new Error("Fixture RSC não encontrado; revise o harness para a versão instalada do Next.");
    if (!config.leadEndpoint && !config.whatsappNumber && !config.contactEmail)
        html = html.replace(/(data-cfg-warning="") hidden=""/, "$1");
    return html;
}
export async function openHarness(output) {
    if (typeof WebSocket !== "function") throw new Error("O navegador de QA requer Node com WebSocket global.");
    await mkdir(output, { recursive: true });
    console.log(JSON.stringify({ qaOutput: output }));
    let sourceServer;
    let originalOrigin;
    if (referenceDir) {
        const source = await realpath(referenceDir);
        sourceServer = createServer(async (request, response) => {
            if (!["GET", "HEAD"].includes(request.method)) {
                response.writeHead(403).end();
                return;
            }
            try {
                const pathname = new URL(request.url, "http://localhost").pathname;
                const target = await realpath(path.join(source, pathname === "/" ? "index.html" : decodeURIComponent(pathname)));
                if (!target.startsWith(source + path.sep))
                    throw new Error("Path outside reference");
                const data = await readFile(target);
                const type = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".woff2": "font/woff2" }[path.extname(target)];
                response.writeHead(200, { "Content-Type": type || "application/octet-stream", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'" });
                response.end(data);
            }
            catch {
                response.writeHead(404).end();
            }
        });
        await new Promise((resolve, reject) => { sourceServer.once("error", reject); sourceServer.listen(0, "127.0.0.1", resolve); });
        originalOrigin = `http://127.0.0.1:${sourceServer.address().port}`;
    }
    // A local deny proxy also blocks browser background traffic outside CDP.
    const denyProxy = createServer((request, response) => { request.resume(); response.writeHead(403).end(); });
    denyProxy.on("connect", (request, socket) => socket.end("HTTP/1.1 403 Forbidden\r\n\r\n"));
    denyProxy.on("upgrade", (request, socket) => socket.destroy());
    await new Promise((resolve, reject) => { denyProxy.once("error", reject); denyProxy.listen(0, "127.0.0.1", resolve); });
    const proxyUrl = `http://127.0.0.1:${denyProxy.address().port}`;
    const profile = await mkdir(path.join(output, "profile"), { recursive: true }).then(() => path.join(output, "profile"));
    const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--disable-background-networking", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--disable-component-update", "--disable-sync", "--disable-extensions", "--disable-default-apps", "--no-first-run", "--no-default-browser-check", "--metrics-recording-only", `--proxy-server=${proxyUrl}`, "--proxy-bypass-list=127.0.0.1;localhost;[::1]", "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
    let endpoint;
    try {
        endpoint = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout iniciando Chrome; configure QA_CHROME_BIN.")), 15000);
            chrome.stderr.on("data", chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) {
                clearTimeout(timeout);
                resolve(match[1]);
            } });
            chrome.once("error", error => { clearTimeout(timeout); reject(error); });
            chrome.once("exit", code => { clearTimeout(timeout); reject(new Error(`Chrome encerrou durante a inicialização (${code}).`)); });
        });
    }
    catch (error) {
        chrome.kill("SIGTERM");
        sourceServer?.close();
        denyProxy.close();
        throw error;
    }
    const ws = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let sequence = 0;
    const pending = new Map(), labels = new Map(), fixtures = new Map();
    const logs = { errors: [], console: [], httpErrors: [], blocked: [], requests: [] };
    const posts = [], heldScripts = [];
    const heldMocks = new Map();
    const origins = [baseUrl, originalOrigin].filter(Boolean);
    function send(method, params = {}, sessionId) {
        return new Promise((resolve, reject) => {
            const id = ++sequence;
            const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
            pending.set(id, { resolve, reject, timeout });
            ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
    }
    ws.onmessage = async ({ data }) => {
        const message = JSON.parse(data);
        if (message.id) {
            const task = pending.get(message.id);
            if (task) {
                clearTimeout(task.timeout);
                pending.delete(message.id);
                if (message.error) task.reject(new Error(JSON.stringify(message.error)));
                else task.resolve(message.result);
            }
            return;
        }
        const label = labels.get(message.sessionId);
        try {
            if (message.method === "Fetch.requestPaused") {
                const { request, requestId, resourceType } = message.params;
                const fixture = fixtures.get(label);
                if (request.url === baseUrl + "/__lead-mock" && request.method === "POST" && fixture) {
                    posts.push({ label, request });
                    logs.requests.push({ label, method: "POST", url: request.url, mocked: true });
                    const mock = fixture.mock || {};
                    if (mock.hold) { heldMocks.set(label, { requestId, sessionId: message.sessionId, mock }); return; }
                    if (mock.hang)
                        return;
                    if (mock.delay)
                        await sleep(mock.delay);
                    try {
                        await send(mock.fail ? "Fetch.failRequest" : "Fetch.fulfillRequest", mock.fail ? { requestId, errorReason: "Failed" } : { requestId, responseCode: mock.status || 200, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(mock.body ?? { ok: true })).toString("base64") }, message.sessionId);
                    }
                    catch { /* A deliberately aborted mock may have been cancelled. */ }
                    return;
                }
                if (fixture?.blockScripts && request.url.startsWith(baseUrl + "/") && resourceType === "Script") {
                    heldScripts.push({ requestId, sid: message.sessionId });
                    return;
                }
                if (fixture && resourceType === "Document" && new URL(request.url).origin === baseUrl && new URL(request.url).pathname === "/" && request.method === "GET") {
                    const html = fixtureHtml(await readLocalHtml(), fixture.config);
                    await send("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }], body: Buffer.from(html).toString("base64") }, message.sessionId);
                    return;
                }
                const allowed = origins.some(origin => request.url.startsWith(origin + "/")) && ["GET", "HEAD"].includes(request.method);
                const entry = { label, method: request.method, url: request.url };
                logs.requests.push(entry);
                if (!allowed)
                    logs.blocked.push(entry);
                await send(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed ? { requestId } : { requestId, errorReason: "BlockedByClient" }, message.sessionId);
            }
            if (message.method === "Runtime.exceptionThrown")
                logs.errors.push({ label, details: message.params.exceptionDetails });
            if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type))
                logs.console.push({ label, type: message.params.type, args: message.params.args });
            if (message.method === "Network.responseReceived" && message.params.response.status >= 400)
                logs.httpErrors.push({ label, url: message.params.response.url, status: message.params.response.status });
        }
        catch (error) {
            logs.errors.push({ label, harness: String(error) });
        }
    };
    async function evaluate(sessionId, expression) {
        const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
        if (result.exceptionDetails)
            throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    }
    async function createPage(label, { original = false, width = 1440, height = 1000, reduced = false, jsDisabled = false, noObserver = false, extraInit = "", config = fakeLeadConfig, mock, blockScripts = false, query = "", freezeSimulation = false, readOnly = false } = {}) {
        if (original && !originalOrigin)
            throw new Error("Comparação original requer QA_REFERENCE_DIR.");
        if (!original && !readOnly)
            fixtures.set(label, { config: safeFixture(config), mock, blockScripts });
        const { targetId } = await send("Target.createTarget", { url: "about:blank" });
        const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
        labels.set(sessionId, label);
        for (const method of ["Page.enable", "Runtime.enable", "Network.enable"])
            await send(method, {}, sessionId);
        await send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] }, sessionId);
        await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);
        await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] }, sessionId);
        await send("Page.addScriptToEvaluateOnNewDocument", { source: preload({ extraInit, original, noObserver, freezeSimulation, readOnly }) }, sessionId);
        if (jsDisabled)
            await send("Emulation.setScriptExecutionDisabled", { value: true }, sessionId);
        await send("Page.navigate", { url: (original ? originalOrigin : baseUrl) + "/" + query }, sessionId);
        await send("Page.bringToFront", {}, sessionId);
        for (let i = 0; i < 100; i++) {
            if (await evaluate(sessionId, "!!document.querySelector('[data-lead-form]')"))
                break;
            await sleep(100);
        }
        await evaluate(sessionId, "document.fonts.ready.then(()=>true)");
        if (!original && !jsDisabled && !blockScripts) {
            for (let i = 0; i < 100; i++) {
                if (await evaluate(sessionId, "!document.querySelector('#f-nome').matches(':disabled')"))
                    return sessionId;
                await sleep(100);
            }
            throw new Error("A hidratação não concluiu; confira QA_BASE_URL e a origem do HMR em dev.");
        }
        await sleep(100);
        return sessionId;
    }
    async function screenshot(sessionId, name, full = false) {
        const metrics = await send("Page.getLayoutMetrics", {}, sessionId);
        const params = { format: "png", captureBeyondViewport: full };
        if (full)
            params.clip = { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 };
        const result = await send("Page.captureScreenshot", params, sessionId);
        await writeFile(path.join(output, name), Buffer.from(result.data, "base64"));
    }
    async function releaseMock(label) {
        const item = heldMocks.get(label);
        if (!item) throw new Error(`Mock pendente não encontrado: ${label}`);
        heldMocks.delete(label);
        await send("Fetch.fulfillRequest", { requestId: item.requestId, responseCode: item.mock.status || 200, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(item.mock.body ?? { ok: true })).toString("base64") }, item.sessionId);
    }
    async function stop() {
        ws.close();
        chrome.kill("SIGTERM");
        denyProxy.closeAllConnections();
        await new Promise(resolve => denyProxy.close(resolve));
        if (sourceServer) {
            sourceServer.closeAllConnections();
            await new Promise(resolve => sourceServer.close(resolve));
        }
    }
    return { send, evaluate, createPage, screenshot, stop, releaseMock, logs, posts, heldScripts, output, originalOrigin, nextOrigin: baseUrl };
}
function preload({ extraInit, original, noObserver, freezeSimulation, readOnly }) {
    return `
    ${extraInit}
    window.open=()=>null; navigator.sendBeacon=()=>false;
    document.addEventListener('click',e=>{const a=e.target.closest?.('a');if(a&&!a.href.startsWith(location.origin+'/')&&!a.href.startsWith(location.origin+'#')){e.preventDefault();e.stopImmediatePropagation()}},true);
    ${original || readOnly ? "document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation()},true);" : ""}
    ${readOnly ? "for(const type of ['click','keydown'])document.addEventListener(type,e=>{if(e.target.closest?.('form')){e.preventDefault();e.stopImmediatePropagation()}},true);" : ""}
    window.__qa={observers:[],activeIntervals:{},activeTimers:{},timerEvents:[]};
    {const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;window.__listeners=[];EventTarget.prototype.addEventListener=function(type,fn,...args){if(['visibilitychange','pagehide','blur'].includes(type))window.__listeners.push({target:this,type,fn,active:true});return add.call(this,type,fn,...args)};EventTarget.prototype.removeEventListener=function(type,fn,...args){const found=window.__listeners.find(e=>e.active&&e.target===this&&e.type===type&&e.fn===fn);if(found)found.active=false;return remove.call(this,type,fn,...args)}}
    {const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window),setInterval=window.setInterval.bind(window),clearInterval=window.clearInterval.bind(window);
     const watched=[30,450,1400,1700,2300,2900,3500,4100,4700,9000],simulation=[30,1700,2300,2900,3500,4100,4700,9000],jobs=new Map();let synthetic=0,now=0;
     window.setTimeout=(fn,ms,...args)=>{if(${freezeSimulation}&&simulation.includes(ms)){const id=--synthetic;jobs.set(id,{due:now+ms,fn,args});window.__qa.activeTimers[id]=ms;return id}let id;id=set((...params)=>{delete window.__qa.activeTimers[id];if(watched.includes(ms))window.__qa.timerEvents.push({delay:ms,time:performance.now()});typeof fn==='function'?fn(...params):eval(fn)},ms,...args);if(watched.includes(ms))window.__qa.activeTimers[id]=ms;return id};
     window.clearTimeout=id=>{jobs.delete(id);delete window.__qa.activeTimers[id];return clear(id)};
     window.setInterval=(fn,ms,...args)=>{if(${freezeSimulation}&&ms===1000){const id=--synthetic;jobs.set(id,{due:now+ms,fn,args,interval:ms});window.__qa.activeIntervals[id]=ms;return id}const id=setInterval(fn,ms,...args);window.__qa.activeIntervals[id]=ms;return id};
     window.clearInterval=id=>{jobs.delete(id);delete window.__qa.activeIntervals[id];return clearInterval(id)};
     window.__qa.advanceSimulation=delta=>{const end=now+delta;while(true){const next=[...jobs].filter(([,job])=>job.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];if(!next)break;const[id,job]=next;now=job.due;if(job.interval)job.due+=job.interval;else{jobs.delete(id);delete window.__qa.activeTimers[id]}job.fn(...job.args)}now=end};
    }
    ${noObserver ? "delete window.IntersectionObserver;" : `{const Native=window.IntersectionObserver;window.IntersectionObserver=class extends Native{constructor(callback,options){const record={options,targets:[],disconnects:0,entries:[]};super((entries,observer)=>{record.entries.push(...entries.map(e=>({time:performance.now(),intersecting:e.isIntersecting,ratio:e.intersectionRatio,target:e.target.getAttribute('data-sim-cam')!==null?'camera':e.target.id||e.target.tagName})));callback(entries,observer)},options);this.record=record;window.__qa.observers.push(record)}observe(el){this.record.targets.push(el.getAttribute('data-sim-cam')!==null?'camera':el.id||el.tagName);return super.observe(el)}disconnect(){this.record.disconnects++;return super.disconnect()}}}`}
  `;
}
