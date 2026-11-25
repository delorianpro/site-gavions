import { existsSync, mkdtempSync, mkdirSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export function localUrl(value) {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.username || url.password) {
        throw new Error("QA permite somente URLs HTTP(S) de loopback, sem credenciais.");
    }
    return url;
}
const address = localUrl(process.env.QA_BASE_URL || "http://127.0.0.1:3107");
if (address.pathname !== "/" || address.search || address.hash)
    throw new Error("QA_BASE_URL deve conter somente a origem local.");
export const baseUrl = address.origin;
export const referenceDir = process.env.QA_REFERENCE_DIR ? resolve(process.env.QA_REFERENCE_DIR) : null;
if (referenceDir && !existsSync(join(referenceDir, "index.html")))
    throw new Error("QA_REFERENCE_DIR não contém index.html.");
export const outputRoot = process.env.QA_OUTPUT_DIR ? resolve(process.env.QA_OUTPUT_DIR) : mkdtempSync(join(tmpdir(), "gavions-qa-"));
const outputRelative = relative(projectRoot, outputRoot);
if (!outputRelative || (!outputRelative.startsWith(`..${sep}`) && outputRelative !== ".." && !isAbsolute(outputRelative))) {
    throw new Error("QA_OUTPUT_DIR deve ficar fora do projeto para não misturar fontes e artefatos.");
}
mkdirSync(outputRoot, { recursive: true });
const physicalRoot = realpathSync(outputRoot);
const physicalRelative = relative(realpathSync(projectRoot), physicalRoot);
if (!physicalRelative || (!physicalRelative.startsWith(`..${sep}`) && physicalRelative !== ".." && !isAbsolute(physicalRelative))) {
    throw new Error("QA_OUTPUT_DIR não pode apontar por symlink para o projeto.");
}
export function outputDir(name) {
    const directory = join(outputRoot, name);
    mkdirSync(directory, { recursive: true });
    return directory;
}
export const chromePath = process.env.QA_CHROME_BIN || "google-chrome";
export const fakeLeadConfig = {
    leadEndpoint: baseUrl + "/__lead-mock",
    leadEndpointFormat: "json",
    whatsappNumber: "",
    contactEmail: "qa@example.invalid",
    requestTimeoutMs: 15000,
    responseContract: { kind: "json", field: "ok", value: true },
};
export function safeFixture(config) {
    if (config.leadEndpoint && config.leadEndpoint !== `${baseUrl}/__lead-mock`)
        throw new Error("O POST do QA deve usar exclusivamente o destino interceptado.");
    if (config.contactEmail && config.contactEmail !== fakeLeadConfig.contactEmail)
        throw new Error("E-mail do QA deve ser fictício.");
    if (config.whatsappNumber && config.whatsappNumber !== "5500000000000")
        throw new Error("WhatsApp do QA deve usar o número fictício reservado aos testes.");
    return config;
}
