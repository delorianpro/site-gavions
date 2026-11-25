# Correção visual de “Para quem é”

Implementada exclusivamente na worktree `fix-audience-layout`, em 25/11/2026.
Alteração visual intencional após a migração: o layout horizontal defeituoso do
HTML original não deve ser restaurado para satisfazer equivalência geométrica.
Este registro não autoriza commit, push, merge ou deploy.

## Causa

`FeatureCard` já renderiza, nesta ordem, o contêiner do ícone, `h3` e `p`.
`Primitives.module.css` fornece os estilos de superfície, tipografia e espaçamento
dos cards e não exige alterações.

O CSS Module de `AudienceSection` aplicava `.seg { display: flex }`, cuja direção
padrão é `row`. Os três filhos disputavam a largura interna do card. Além disso,
`.seg span { flex: 1 }` sobrescrevia o `flex: none` do ícone compartilhado,
permitindo sua compressão e distribuição inadequada de espaço. As descrições
ultrapassavam a área interna, mesmo sem aumentar o `scrollWidth` da página.

Essas regras vieram da classe `.seg` do HTML original, também usada para controles
segmentados nas telas ilustrativas. A migração as isolou neste módulo, mas
preservou o efeito inadequado nos cards. A grade compartilhada `g5` também
produzia quatro cards mais um isolado em 1024 px.

## Implementação e escopo

- `components/sections/AudienceSection.tsx`: substituição de `shared.g5` por
  `styles.grid`, mantendo a grade compartilhada, textos, ícones, ordem e delays.
- `components/sections/AudienceSection.module.css`: `flex-direction: column`,
  `text-align: left` e `min-width: 0` no card; `flex: none` e
  `align-self: flex-start` no contêiner do ícone. Os textos preenchem a largura
  interna pelo alinhamento padrão de stretch dos filhos do flex em coluna.
  As demais declarações visuais do ícone foram preservadas.
- Este documento registra a mudança intencional e suas validações.

Continuam valendo o padding de 24 px, a distância de 16 px do ícone ao título,
8 px do título à descrição e o gap de 16 px da grade. As colunas usam
`minmax(0, 1fr)`. O stretch padrão do CSS Grid uniformiza as alturas de cada
linha segundo o maior conteúdo daquela linha, sem altura fixa, mínimo artificial
de altura ou redistribuição de espaço entre os textos.

Não houve edição de `FeatureCard`, `Primitives.module.css`, `Reveal`, estilos
globais, outras seções, textos, logotipos, dependências ou `referencia-original`.
As alterações pré-existentes em `BrandImage.tsx` e no PNG do mascote foram
preservadas. Nenhuma integração comercial foi executada.

## Distribuição e resultados

Breakpoints locais: uma coluna abaixo de 560 px, duas de 560 a 767 px, três de
768 a 1199 px e cinco a partir de 1200 px. O limite existente de 1200 px do
contêiner impede que os cards se alarguem excessivamente em monitores maiores.

| Viewport | Distribuição por linha | Alturas dos cards por linha, em px |
| --- | --- | --- |
| 1920 | 5 | 263,16 |
| 1440 | 5 | 263,16 |
| 1200 | 5 | 263,16 |
| 1024 | 3 + 2 | 216,14 / 216,14 |
| 768 | 3 + 2 | 263,16 / 240,70 |
| 600 | 2 + 2 + 1 | 216,14 / 216,14 / 216,14 |
| 390 | 1 + 1 + 1 + 1 + 1 | 191,58 / 191,58 / 191,58 / 216,14 / 191,58 |
| 320 | 1 + 1 + 1 + 1 + 1 | 216,14 / 216,14 / 191,58 / 216,14 / 216,14 |

Medições em Chrome headless, escala 1, fonte Inter local. As alturas são
observações, não valores definidos no CSS. A seção pode ficar mais alta no
celular por exibir todos os elementos verticalmente e sem compressão.

Foram aprovadas 56 verificações de layout em desenvolvimento e outras 56 no
build de produção, cobrindo as oito larguras: colunas, alturas por linha, ausência
de overflow, ordem vertical, alinhamento, largura dos textos, ícones de 46 × 46,
contenção vertical, preservação literal dos textos e ausência de regressão nas
demais seções. Os retângulos de cada linha de texto foram conferidos contra a
área interna dos cards; o resultado não depende apenas de `overflow-x: hidden`.

As outras seções mantiveram largura e altura; seus cards mantiveram textos,
estilos computados e posições relativas à seção. O deslocamento vertical das
seções posteriores, causado pela nova altura de “Para quem é”, é esperado.
Não houve cortes, sobreposições, deformações ou rolagem horizontal na seção.

| Validação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado |
| `npx tsc --noEmit` | Aprovado |
| `npm run build` | Aprovado; página pré-renderizada |
| `git diff --check` | Aprovado |
| `scripts/qa/interactions.mjs` | 56 verificações aprovadas, incluindo header, abas, teclado, FAQ, CTA, reveals, movimento reduzido, simulação e fallback sem JS |
| `scripts/qa/accessibility.mjs` | Zero violações axe em seis estados: 1440, 390 e 320 px, pendente/concluído; resultados inconclusivos de contraste continuam registrados |
| `scripts/qa/page.mjs` | Interrompido no teste de dimensões das imagens por divergência pré-existente do mascote |

O primeiro build dentro do sandbox compilou, mas não recebeu a saída de
`TypeScript --showConfig`. A execução com as permissões necessárias passou.
Os testes de navegador usam o harness existente com bloqueio de tráfego externo
e de envio real de formulários. A suíte de interações foi executada sem comparação
com o original; nenhuma baseline de equivalência visual foi modificada.

O mascote pré-existente mede 359 × 248, enquanto `BrandImage` declara 360 × 250.
A restrição de não alterar logotipos foi respeitada; essa falha da suíte geral não
foi corrigida nesta tarefa. A validação de reflow nas oito larguras e a comparação
das demais seções foram realizadas pelo roteiro específico de layout.

## Capturas e evidências locais

Artefatos fora do checkout, em `/tmp/gavions-audience-layout-20261125/`:

- `before/report.json`: medidas e estilos registrados antes da alteração.
- `after-dev/report.json` e `after/report.json`: verificações em dev e produção.
- `regression/`: relatórios das suítes existentes de interações, página e axe.
- `capture.mjs` e `screenshots.mjs`: roteiros de medição e captura sem dependências novas.
- `screenshots/comparison-<largura>.png`: antes/depois nas oito larguras.
- `screenshots/before-<largura>.png` e `after-<largura>.png`: capturas individuais.

As capturas comparativas finais usam o build de produção. O CSS anterior foi
reproduzido apenas na página isolada do navegador, e a geometria dos cinco cards
foi conferida exatamente contra o registro anterior à implementação. Isso permite
capturas equivalentes sem reverter arquivos na worktree. Cabeçalho e controles
flutuantes foram ocultados somente nessas imagens isoladas da seção; seus
comportamentos reais foram preservados e testados na suíte de interações.

| Largura | Comparativo |
| --- | --- |
| 1920 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-1920.png) |
| 1440 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-1440.png) |
| 1200 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-1200.png) |
| 1024 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-1024.png) |
| 768 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-768.png) |
| 600 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-600.png) |
| 390 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-390.png) |
| 320 | [Antes/depois](/tmp/gavions-audience-layout-20261125/screenshots/comparison-320.png) |

Os artefatos em `/tmp` são locais e temporários; não fazem parte do versionamento.
