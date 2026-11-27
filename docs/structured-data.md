# Etapa 3 — JSON-LD: implementação e recuperação

Relatório de 27/11/2026. Ambiente confirmado: worktree `seo-optimization`, branch
`feat/seo-optimization`, diretório
`/home/larissa/sites/site-gavions-workspace/seo-optimization`.

## Diagnóstico após a interrupção

A implementação da etapa 3 estava salva e consistente com a solicitação original.
O grafo, sua renderização na home e os testes de SEO já existiam. O relatório
final ainda não havia sido gravado. Nenhum arquivo da aplicação precisou de
correção ou reimplementação na retomada.

O estado encontrado tinha cinco arquivos rastreados modificados:
`app/layout.tsx`, `app/page.tsx`, `lib/site-config.ts`, `scripts/qa/page.mjs` e
`scripts/qa/README.md`. Também havia cinco arquivos novos: `app/robots.ts`,
`app/sitemap.ts`, `lib/structured-data.ts`, `scripts/qa/seo.mjs` e
`scripts/qa/structured-data.mjs`. Isso reúne trabalho das etapas 1, 2 e 3;
o diff em relação ao último commit não corresponde somente à etapa 3.

Foram recuperados relatórios completos de SEO (3/3), página (31/31), interações
(56/56), validação/transporte de leads (14/14), backend com mocks (23/23) e
Black Friday (16/16). A resposta do Schema.org Validator também estava salva,
com zero erros e zero avisos. As capturas e os snapshots antes/depois estavam
presentes e foram inspecionados novamente.

A suíte completa do formulário havia deixado capturas responsivas, mas não
`report.json`. Portanto, seu resultado anterior não foi considerado aprovado.
Ela foi iniciada novamente do começo, mantendo os testes e a aplicação intactos.
Não havia validação específica registrada de BackToTop; foi acrescentado um
roteiro de QA para esse controle, sem mudar seu comportamento.

A inspeção de processos fora do namespace do sandbox e da porta 3107 não
encontrou servidor Next, suíte ou Chrome de QA remanescente desta atividade.
O Chrome pessoal encontrado, com diretório de trabalho `/home/larissa`, foi
preservado. Nenhum processo de outro projeto ou worktree foi encerrado.

## Arquivos e preservação

| Arquivo | Trabalho da etapa 3 e situação na retomada |
| --- | --- |
| `lib/structured-data.ts` | Criado antes da interrupção; grafo e tipos locais preservados integralmente. |
| `app/page.tsx` | Recebeu a importação e o script da home antes da interrupção; preservado na retomada. |
| `app/layout.tsx` | Teve somente o bloco JSON-LD antigo removido na etapa 3; preservado na retomada. |
| `scripts/qa/structured-data.mjs` | Asserções compartilhadas criadas anteriormente; preservadas. |
| `scripts/qa/seo.mjs` | Teste do HTML inicial, logotipo e serialização criado anteriormente; preservado. |
| `scripts/qa/page.mjs` | Novos checks do grafo, inclusive sem JavaScript, preservados junto aos testes anteriores de metadados. |
| `scripts/qa/README.md` | Documentação dos testes de SEO preservada; acrescentado o comando e a cobertura do BackToTop na retomada. |
| `scripts/qa/back-to-top.mjs` | Criado na retomada para validar o controle existente. |
| `docs/structured-data.md` | Relatório final criado na retomada. |

As etapas 1 e 2 continuam preservadas, inclusive os arquivos ainda não
registrados em commits. `lib/site-config.ts` é idêntico, byte a byte, ao snapshot
anterior à etapa 3. Os exports de metadados de `app/layout.tsx` e `app/page.tsx`
também correspondem ao snapshot anterior. Robots, sitemap, `next.config.ts`,
favicons, fontes, viewport, componentes, textos visíveis, formulário, backend,
Supabase, BackToTop, campanha e CSS não foram alterados nesta retomada.

A conferência final usa hashes dos arquivos existentes no início da retomada,
registrados fora do checkout. Não foram utilizados reset, restore, clean ou
stash. Não houve instalação de dependências, commit, push, merge ou deploy.
A etapa 4 não foi iniciada.

## Estrutura anterior e justificativa técnica

A implementação anterior à etapa 3 estava em `app/layout.tsx`: um único
`Service` sem `@id`, nome `Gavions: vigilância inteligente`, `areaServed: "BR"`
e provedor embutido `{ "@type": "Organization", "name": "Gavions" }`.
Ela confundia a marca comercial com a prestadora e declarava atendimento nacional.

A nova implementação contém um único `@graph`, com quatro entidades relacionadas
por identificadores estáveis. A empresa Delorian é a prestadora; Gavions é
`Brand`. A busca no código não encontrou outra definição concorrente.

O grafo foi extraído para `lib/structured-data.ts`, com tipagem local do
subconjunto de Schema.org necessário, sem dependências. A renderização fica
restrita a `app/page.tsx`, permitindo que futuras páginas tenham seus próprios
grafos sem herdar automaticamente o serviço da home. A remoção do JSON-LD no
layout evita duplicação; nenhuma estrutura visual do layout foi modificada.

Foi seguido o guia da versão instalada do Next.js em
`node_modules/next/dist/docs/01-app/02-guides/json-ld.md`: elemento nativo
`script[type="application/ld+json"]`, produzido pelo componente de servidor,
com `JSON.stringify` e escape de `<` como `\u003c`. O teste inclui tentativa de
fechamento com `</script>` e confirma que `JSON.parse` recupera o conteúdo original.
A presença no HTML HTTP inicial e com JavaScript desativado foi comprovada.
Não há dependência de hidratação ou `useEffect` para disponibilizar o grafo.
A constante `siteUrl` é reutilizada sem alteração e todas as URLs são absolutas.

## Identidade institucional e relacionamentos

O [site oficial da Delorian](https://delorianpro.com.br) foi consultado na
execução anterior e respondeu HTTP 200, após redirecionamento para
`https://www.delorianpro.com.br/`. O HTML público foi recuperado de
`/tmp/gavions-delorian-before.html`: não contém blocos JSON-LD nem identificador
institucional verificável em microdados. Foi adotada a proposta do pedido:
`https://delorianpro.com.br/#organization`. Trata-se de um ID proposto para a
identidade institucional, não de um ID confirmado como já publicado pela Delorian.
O domínio sem `www` segue a informação fornecida pelo responsável.

| Tipo | Identificador | Referências estabelecidas |
| --- | --- | --- |
| Organization — Delorian | `https://delorianpro.com.br/#organization` | `brand` → Gavions |
| Brand — Gavions | `https://www.gavions.com/#brand` | Referenciada pela empresa, pelo serviço e pelo site |
| Service | `https://www.gavions.com/#service` | `provider` → Delorian; `brand` → Gavions |
| WebSite | `https://www.gavions.com/#website` | `publisher` → Delorian; `about` → Gavions |

Os quatro IDs são únicos e as cinco referências resolvem dentro do grafo.
Não há `parentOrganization`, `subOrganization`, nomes alternativos ou
`SearchAction`. Não foram inventados razão social, CNPJ, telefone, endereço,
fundação, certificações, redes sociais, avaliações, preços ou ofertas.
A Organization não recebeu o logotipo da marca nem uma área de atendimento
inferida para todos os serviços da Delorian.

## Logotipo e correspondência com o conteúdo

Arquivo selecionado: `public/assets/img/gavions-nome.png`, PNG transparente de
720 × 116 pixels. A inspeção visual confirmou a assinatura branca com raio verde,
usada por `BrandImage` no cabeçalho e no rodapé, com alt `Gavions`.
Não foi utilizada arte promocional ou imagem de compartilhamento.

URL: `https://www.gavions.com/assets/img/gavions-nome.png`.
Na execução anterior, a URL pública respondeu HTTP 200, `image/png`, e seu
arquivo foi salvo em `/tmp/gavions-logo-production.png`. Na retomada, os bytes
desse download foram comparados novamente ao arquivo local e são idênticos.
O teste HTTP local foi repetido e confirmou status 200, MIME, assinatura PNG,
dimensões e igualdade de bytes com o recurso do repositório. A verificação do
recurso público é histórica desta execução; não foi repetida pela internet.

| Informação no JSON-LD | Evidência visível ou confirmação institucional |
| --- | --- |
| Gavions como identidade da solução | Marca no cabeçalho, hero e rodapé |
| Delorian como responsável | Texto “Desenvolvida pela Delorian…” em `#demonstracao`; prestação do serviço confirmada no pedido |
| Monitoramento com IA, invasões, pessoas e veículos | Hero, como funciona e simulação |
| WhatsApp e acionamento de sirenes/refletores | Como funciona, recursos e simulação |
| Condição de horário protegido | Hero e como funciona; preservada na descrição do serviço |
| Empresas, galpões, lojas e obras | Seção `#para-quem` |

As descrições sintetizam o conteúdo da landing page e os dados confirmados,
sem funcionalidades extras ou promessas de segurança não comprovadas.

## Situação de areaServed

A declaração nacional anterior foi removida. `areaServed` permanece omitida,
porque o conteúdo visível ainda não informa a Região Sul e os três estados.
A omissão segue a condição expressa do pedido original, não uma dúvida sobre a
abrangência confirmada. Também não se restringiu o serviço Gavions a Curitiba,
nem se atribuiu sua cobertura aos demais serviços da Delorian.

Sugestão, sem implementá-la: junto ao texto institucional em `#demonstracao`,
inserir após aprovação:

> O serviço Gavions atende a Região Sul do Brasil: Paraná, Santa Catarina e Rio Grande do Sul.

Depois de essa informação estar visível, acrescentar ao `Service` três entidades
`AdministrativeArea`, com os nomes dos estados e `containedInPlace` do tipo
`Country`, nome `Brasil`. Os testes deverão então ser atualizados para aceitar
a cobertura confirmada. Nenhum texto visível foi modificado nesta etapa.

## JSON-LD completo efetivamente renderizado

Extraído da resposta HTTP do build de produção na retomada. Abaixo há apenas
formatação para leitura; o elemento script contém JSON compacto.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://delorianpro.com.br/#organization",
      "name": "Delorian",
      "url": "https://delorianpro.com.br",
      "brand": {
        "@id": "https://www.gavions.com/#brand"
      }
    },
    {
      "@type": "Brand",
      "@id": "https://www.gavions.com/#brand",
      "name": "Gavions",
      "url": "https://www.gavions.com/",
      "description": "Gavions é a marca da Delorian para monitoramento inteligente de câmeras com inteligência artificial para empresas, galpões, lojas e obras.",
      "logo": "https://www.gavions.com/assets/img/gavions-nome.png"
    },
    {
      "@type": "Service",
      "@id": "https://www.gavions.com/#service",
      "name": "Monitoramento inteligente de câmeras com IA",
      "serviceType": "Monitoramento de câmeras com inteligência artificial",
      "url": "https://www.gavions.com/",
      "description": "Monitoramento inteligente de câmeras com IA para empresas, galpões, lojas e obras, com detecção de invasões, reconhecimento de pessoas e veículos, alertas pelo WhatsApp e acionamento automático de sirenes e refletores no horário protegido.",
      "provider": {
        "@id": "https://delorianpro.com.br/#organization"
      },
      "brand": {
        "@id": "https://www.gavions.com/#brand"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.gavions.com/#website",
      "name": "Gavions",
      "url": "https://www.gavions.com/",
      "inLanguage": "pt-BR",
      "publisher": {
        "@id": "https://delorianpro.com.br/#organization"
      },
      "about": {
        "@id": "https://www.gavions.com/#brand"
      }
    }
  ]
}
```

## Validações recuperadas e repetidas

“Recuperado” indica resultado comprovado por arquivo de relatório existente,
não inferido de capturas ou de progresso parcial. “Repetido” identifica execução
nova nesta retomada.

| Verificação | Execução anterior recuperada | Retomada |
| --- | --- | --- |
| Lint | Aprovação registrada na ferramenta da execução anterior | Repetido: aprovado; conferência final após novo roteiro de QA |
| TypeScript | Aprovação registrada na ferramenta da execução anterior | Repetido: `npx tsc --noEmit`, aprovado |
| Build de produção | Aprovação registrada na ferramenta da execução anterior | Repetido: aprovado, home estática |
| HTML inicial, grafo, PNG e serialização — `seo.mjs` | 3/3, relatório recuperado | Repetido: 3/3, grafo idêntico ao anterior |
| Metadados, SEO, reflow e oito larguras — `page.mjs` | 31/31, relatório recuperado | Preservado; sem necessidade de repetir a suíte completa |
| Validação/transporte de leads — `leads.mjs` | 14/14, relatório recuperado | Preservado; código de transporte inalterado |
| Backend com mocks — `leads-api.mjs` | 23/23, relatório recuperado | Preservado; backend inalterado |
| Black Friday — `black-friday.mjs` | 16/16, relatório recuperado | Preservado; campanha inalterada |
| Interações — `interactions.mjs` | 56/56, relatório recuperado | Preservado; componentes inalterados |
| Formulário completo — `form.mjs` | Sem relatório final; não considerado aprovado | Repetido integralmente: 176/176 aprovadas; 21 POSTs simulados, sem chamadas comerciais |
| BackToTop — `back-to-top.mjs` | Sem validação específica registrada | Novo teste: 26/26 aprovadas; desktop/mobile, teclado, colisões, movimento normal/reduzido e fallbacks |
| `git diff --check` | Aprovado anteriormente | Repetido: aprovado |
| Schema.org Validator | HTTP 200; zero erros e zero avisos | Resposta recuperada e vinculada ao mesmo JSON-LD atual; sem novo envio |

Os testes do grafo validam sintaxe, quatro entidades, unicidade de IDs,
referências por ID, prestadora e marca corretas, URLs HTTPS dos domínios oficiais
e ausência de dados indevidos, inclusive cobertura nacional. Os testes de página
confirmam metadados anteriores, H1, seções, IDs, alt, recursos e ausência de
erros de hidratação. O grafo também foi conferido com JavaScript desativado.

A resposta preservada do [Schema.org Validator](https://validator.schema.org/)
contém o JSON enviado. Sua igualdade com o JSON-LD extraído na retomada foi
verificada. O validador apresenta WebSite e Service como duas raízes, com
Organization e Brand relacionados; os quatro IDs aparecem na resposta.
A contagem de duas raízes não significa perda de entidades. Os tipos e
propriedades foram conferidos no vocabulário oficial de
[Organization](https://schema.org/Organization), [Brand](https://schema.org/Brand),
[Service](https://schema.org/Service) e [WebSite](https://schema.org/WebSite).

Os snapshots antes/depois recuperados foram comparados novamente: texto visível,
tags title/meta/link do head e geometria do cabeçalho, das 15 seções e do rodapé
são idênticos nas oito larguras (1440, 1024, 980, 979, 768, 390, 380 e 320).
Sete capturas eram idênticas pixel a pixel; a de 1440 tinha pequenas diferenças
nas áreas gráficas, sem diferenças de conteúdo ou geometria e sem regressão
visual observada na inspeção. Não se afirma identidade de todos os pixels.

Os testes de formulário e backend usam somente dados fictícios, mocks ou
respostas interceptadas. O navegador de QA bloqueia rede externa, janelas e
requisições comerciais; os POSTs simulados não chegam à API real nem ao Supabase.
Não foram acessadas credenciais reais ou inseridos registros remotos.
O teste `client-secrets.mjs`, que exige ler variáveis locais, não foi executado
na retomada para respeitar a restrição sobre credenciais.

## Limitações, temporários e encerramento

O build anterior dentro do sandbox falhou ao capturar a saída de
`tsc --showConfig` no Next.js. Fora dele, o build concluiu normalmente, tanto
antes da interrupção quanto na retomada, sem alterar configuração.
O teste isolado de transporte teve um timeout inicial de 25 ms na execução
simultânea anterior e depois passou 14/14 isoladamente; o relatório aprovado foi
recuperado. Não houve correção funcional motivada por esse timeout de QA.

A validação do BackToTop precisou inicialmente completar o evento Enter no
Chrome DevTools Protocol com seu caractere de texto, como já faz o teste do
formulário. Isso corrigiu a simulação de teclado do novo teste; não houve
alteração no componente BackToTop.

Não houve deploy nem avaliação de indexação pública. Ausência de resultados
ricos no Google não foi tratada como erro. A consulta ao HTML institucional da
Delorian não garante ausência de identificadores em todas as páginas do domínio;
por isso o ID continua documentado como proposta. A inclusão de `areaServed`
é a pendência de conteúdo para aprovação futura e não foi antecipada.

Os temporários da execução anterior permanecem fora do checkout para auditoria:

- `/tmp/gavions-jsonld-stage3/before/`, `after/`, `comparison.json` e `difference-1440.png`: snapshots, capturas e comparação.
- `/tmp/gavions-jsonld-stage3/final/seo/`, `page/` e `interactions/`: relatórios anteriores concluídos.
- `/tmp/gavions-jsonld-stage3/final/form/`: capturas e perfil da suíte interrompida, sem relatório final.
- `/tmp/gavions-jsonld-stage3/schema-validator-response.txt`: resultado externo e payload enviado.
- `/tmp/gavions-qa-KC0b2F/leads/`, `/tmp/gavions-qa-dibSb3/leads-api/` e `/tmp/gavions-qa-b1xVqN/black-friday/`: relatórios isolados aprovados.
- `/tmp/gavions-delorian-before.html`, `/tmp/gavions-logo-production.png`, `/tmp/gavions-validator.html` e `/tmp/gavions-validator.js`: recursos públicos consultados anteriormente.
- Outros perfis, logs e compilados de QA anteriores foram preservados; não são arquivos de produção nem alterações do repositório.

Novas evidências da retomada:

- `/tmp/gavions-jsonld-stage3/recovery/source-before.json`: hashes dos arquivos encontrados.
- `/tmp/gavions-jsonld-stage3/recovery/validation/seo/initial.html` e `rendered.json`: HTML e grafo atuais.
- `/tmp/gavions-jsonld-stage3/recovery/validation/form/report.json`: resultado da repetição integral do formulário.
- `/tmp/gavions-jsonld-stage3/recovery/form.log`: progresso da repetição do formulário.
- `/tmp/gavions-jsonld-stage3/recovery/back-to-top-final/back-to-top/report.json`: resultado final do novo teste.
- As pastas `validation/back-to-top/` e `back-to-top-retry/` preservam as execuções de desenvolvimento do novo roteiro.

O servidor de produção local desta retomada foi encerrado por SIGINT após as validações. A inspeção final confirmou a porta 3107 livre e nenhum processo Next, suíte ou Chrome de QA desta atividade remanescente. O registro está em `/tmp/gavions-jsonld-stage3/recovery/processes-final.json`. Os processos pessoais e de outros projetos foram preservados.

Este relatório e a implementação ficam disponíveis para aprovação da etapa 3.
A etapa 4 permanece fora do escopo executado.
