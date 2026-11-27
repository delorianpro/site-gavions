import assert from "node:assert/strict";

const home = "https://www.gavions.com/";
const organizationId = "https://delorianpro.com.br/#organization";
const ids = {
    Organization: organizationId,
    Brand: home + "#brand",
    Service: home + "#service",
    WebSite: home + "#website",
};

// Shared by the raw HTTP and browser checks; no application configuration is imported.
export function assertStructuredData(documents) {
    assert.equal(documents.length, 1, "Only one JSON-LD graph may be rendered");
    const graph = documents[0];
    assert.equal(graph["@context"], "https://schema.org");
    assert.deepEqual(Object.keys(graph).sort(), ["@context", "@graph"]);
    assert.equal(graph["@graph"].length, 4);
    const entities = graph["@graph"];
    assert.deepEqual(entities.map(node => node["@type"]).sort(), Object.keys(ids).sort());
    assert.equal(new Set(entities.map(node => node["@id"])).size, 4);
    const byType = Object.fromEntries(entities.map(node => [node["@type"], node]));
    for (const [type, id] of Object.entries(ids)) assert.equal(byType[type]["@id"], id);

    const { Organization: organization, Brand: brand, Service: service, WebSite: website } = byType;
    assert.equal(organization.name, "Delorian");
    assert.equal(organization.url, "https://delorianpro.com.br");
    assert.equal(brand.name, "Gavions");
    assert.equal(brand.logo, home + "assets/img/gavions-nome.png");
    assert.equal(service.name, "Monitoramento inteligente de câmeras com IA");
    assert.equal(service.serviceType, "Monitoramento de câmeras com inteligência artificial");
    assert.equal(website.name, "Gavions");
    assert.equal(website.inLanguage, "pt-BR");
    for (const node of [brand, service, website]) assert.equal(node.url, home);
    assert.match(brand.description, /Gavions.*Delorian.*monitoramento.*inteligência artificial/);
    for (const term of ["empresas", "galpões", "lojas", "obras", "invasões", "pessoas", "veículos", "WhatsApp", "sirenes", "refletores", "horário protegido"]) {
        assert.ok(service.description.includes(term), "Supported service description: " + term);
    }
    for (const [node, property, id] of [
        [organization, "brand", ids.Brand], [service, "provider", organizationId],
        [service, "brand", ids.Brand], [website, "publisher", organizationId],
        [website, "about", ids.Brand],
    ]) assert.deepEqual(node[property], { "@id": id });

    // These allowlists also reject unsupported institutional data, promotions,
    // ratings, SearchAction, invented aliases and the former national coverage.
    const allowed = {
        Organization: ["@type", "@id", "name", "url", "brand"],
        Brand: ["@type", "@id", "name", "url", "description", "logo"],
        Service: ["@type", "@id", "name", "url", "serviceType", "description", "provider", "brand"],
        WebSite: ["@type", "@id", "name", "url", "inLanguage", "publisher", "about"],
    };
    for (const node of entities) assert.deepEqual(Object.keys(node).sort(), allowed[node["@type"]].sort());
    function inspect(value) {
        if (!value || typeof value !== "object") return;
        if (value["@id"] && !value["@type"]) {
            assert.deepEqual(Object.keys(value), ["@id"]);
            assert.ok(entities.some(node => node["@id"] === value["@id"]), "Reference resolves within graph");
        }
        for (const [key, item] of Object.entries(value)) {
            if (["@id", "url", "logo"].includes(key)) {
                const url = new URL(item);
                assert.equal(url.protocol, "https:");
                assert.ok(["www.gavions.com", "delorianpro.com.br"].includes(url.hostname));
            }
            inspect(item);
        }
    }
    inspect(graph);
    return graph;
}
