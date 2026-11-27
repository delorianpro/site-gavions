# QA local do Gavions

Suíte sem novo runner ou dependências adicionais. Usa apenas ferramentas já
instaladas, dados fictícios e respostas simuladas. Não inicia servidores da
aplicação, não publica o site e não altera a configuração comercial.

## Pré-requisitos

- Dependências do projeto já instaladas; TypeScript é usado no teste das bibliotecas.
- Node com `WebSocket` global, validado com Node 24.22.1.
- Chrome/Chromium com CDP para testes de navegador; executável `google-chrome`
  no PATH ou definido por `QA_CHROME_BIN`.
- Aplicação local em execução. Use um build de produção para a regressão final.
- `axe-core` já disponível no tooling de desenvolvimento para a auditoria automática.
  Se ausente, o script informa a falta e não tenta instalá-lo.
- Para comparação com o HTML original, forneça `QA_REFERENCE_DIR`, somente leitura.
  Nenhuma cópia do código original é incluída nestes scripts.

## Configuração

| Variável | Uso |
| --- | --- |
| `QA_BASE_URL` | Origem HTTP(S) local; padrão `http://127.0.0.1:3107` |
| `QA_OUTPUT_DIR` | Pasta de saída fora do projeto; por padrão cria pasta única no diretório temporário do sistema |
| `QA_CHROME_BIN` | Caminho ou comando do navegador; padrão `google-chrome` |
| `QA_REFERENCE_DIR` | Pasta opcional que contém index.html e os recursos originais |

Somente localhost, 127.0.0.1 e ::1 são aceitos como destino da aplicação.
Credenciais e caminhos/query na URL base são rejeitados. Portas de CDP, proxy de
bloqueio e servidor de referência são atribuídas automaticamente pelo sistema.
No modo dev, use a mesma origem esperada pelo HMR do servidor, normalmente localhost.
O roteiro page.mjs é o recomendado para avisos de imagens em dev: lê o HTML sem
reescrever RSC e bloqueia ações do formulário. Os ensaios de transporte com fixture
devem usar o build de produção para não interferir na sessão HMR.

A pasta de saída é recusada se estiver dentro do projeto. Ela pode conter relatórios,
capturas e perfis de teste; esses arquivos não pertencem ao commit. Use uma pasta nova
por rodada para preservar os resultados anteriores.

## Execução

Em um terminal, na raiz do projeto:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3107
```

Em outro terminal, defina a URL correspondente e, opcionalmente, a pasta de saída:

```bash
export QA_BASE_URL=http://127.0.0.1:3107
# QA_OUTPUT_DIR deve apontar para uma pasta externa ao checkout.
node scripts/qa/leads.mjs
node scripts/qa/leads-api.mjs
node scripts/qa/client-secrets.mjs
node scripts/qa/black-friday.mjs
node scripts/qa/seo.mjs
node scripts/qa/back-to-top.mjs
node scripts/qa/form.mjs
node scripts/qa/interactions.mjs
node scripts/qa/page.mjs
node scripts/qa/simulation.mjs
node scripts/qa/accessibility.mjs
```

Cada comando informa o resultado e/ou grava `report.json` na pasta da suíte.
Código de saída diferente de zero sinaliza falha. `leads.mjs`, `leads-api.mjs` e `black-friday.mjs` não exigem servidor nem navegador.
`client-secrets.mjs` exige build pronto e as variáveis locais, mas não faz rede
nem imprime credenciais. Os demais exigem a aplicação e o Chrome/Chromium.

Para referência original, configure o caminho correspondente ao seu ambiente:

```bash
# export QA_REFERENCE_DIR=...  # diretório original somente para leitura
node scripts/qa/visual.mjs
node scripts/qa/interactions.mjs
```

`interactions.mjs` funciona sem a referência e informa quais comparações foram
omitidas; `visual.mjs` exige a referência explicitamente. A primeira suíte mantém
a regressão da aplicação disponível em checkouts que não tenham o site antigo.

## Cobertura e limites

| Script | Responsabilidade |
| --- | --- |
| `leads.mjs` | Validação, máscara, saneamento, POST permitido, confirmação explícita, timeout, cancelamento e filtragem de analytics |
| `form.mjs` | Cinco etapas, teclado, foco, persistência, composição, honeypot, duplicidade, desafio, falhas, estados responsivos e proteção sem JS/pré-hidratação |
| `leads-api.mjs` | Handlers com fetch/relógio/ambiente fictícios: normalização, obrigatórios/opcionais, listas, consentimento, origem, token, limites e falhas do Supabase |
| `client-secrets.mjs` | Procura valores e referências de credenciais no bundle público e HTML pré-renderizado, sem exibi-los |
| `black-friday.mjs` | Regressão do calendário, contador e retomada da campanha |
| `interactions.mjs` | Cabeçalho, abas, FAQ, reveals, CTA móvel, sequência/replay/limpeza da simulação e movimento reduzido |
| `page.mjs` | Avisos/proporções das imagens em oito larguras, metadados, IDs, alt, reflow, ano e fallback sem JS |
| `seo.mjs` | HTML HTTP inicial sem navegador, grafo JSON-LD, referências, URLs oficiais, omissão de abrangência ainda não visível, PNG do logotipo e serialização contra fechamento de script |
| `back-to-top.mjs` | Limite de rolagem, teclado, colisão com CTA, retorno ao topo com movimento reduzido e fallback sem JavaScript/IntersectionObserver em desktop e mobile |
| `simulation.mjs` | Contraste sobre fundos rasterizados reais, estados parciais/concluídos, replay, movimento reduzido e capturas |
| `accessibility.mjs` | Axe nos estados pendente e concluído; verificações inconclusivas continuam explícitas |
| `visual.mjs` | Comparação da geometria das seções e das cinco telas ilustrativas com o original |

`browser.mjs` centraliza CDP, isolamento, instrumentação e os mocks; `config.mjs`
centraliza caminhos, origem local e configuração fictícia. Não são comandos de teste.
`structured-data.mjs` compartilha as asserções do grafo entre `seo.mjs` e
`page.mjs`; este também verifica o JSON-LD após hidratação e com JavaScript desativado.
`seo.mjs` requer somente a aplicação local e TypeScript já instalado; não exige navegador,
não chama rotas de leads e não consulta serviços externos.

A simulação usa temporizadores controlados apenas no navegador de QA para manter
instantes equivalentes durante a amostragem. A regressão de interações também
valida os intervalos reais, sem congelamento. Não existe flag ou lógica de teste
na aplicação.

O contraste é calculado em sRGB pela luminância relativa: uma captura sem glifos
preserva o fundo real; amostras sólidas de cor herdam a composição/opacidade do
texto. Todos os pixels internos dos retângulos de texto são avaliados, incluindo
gradientes. A antisserrilha do glifo não entra no cálculo. O padrão exige 4,5:1;
`--measure-only` permite registrar uma referência histórica sem afirmar aprovação.

Os testes não certificam WCAG integral, desempenho público ou todos os recursos
de leitores de tela e aparelhos reais. A auditoria pode apontar fundos complexos
para revisão manual. Capturas não são comparadas pixel a pixel entre engines.

## Proteções contra contatos reais

- Perfil isolado, DNS restrito e proxy local que rejeita tráfego externo.
- Interceptação permite apenas GET/HEAD locais. POST de teste é respondido no
  próprio CDP; jamais é encaminhado ao servidor ou a um serviço comercial.
- Nos ensaios que exercitam o formulário, sua configuração é substituída na resposta HTML/RSC do
  navegador por e-mail `qa@example.invalid`, número fictício ou endpoint local
  interceptado. A configuração da aplicação não é editada.
- GET de desafio `/api/leads/token` também é simulado no CDP. O POST nunca
  alcança a rota real que acessaria o Supabase.
- A leitura de página sem fixture bloqueia também cliques, teclado e submissões
  no formulário; nenhum POST é permitido nesse modo.
- Aberturas de janela, beacons e cliques externos são bloqueados. Testes que
  inspecionam abertura de aplicativo usam spies sem abrir aplicativos.
- A referência é servida com CSP restritiva, apenas para leitura, e todas as suas
  submissões são interrompidas antes do handler original.
- O teste isolado bloqueia fetch global; seus transportes recebem mocks explícitos.

O Chrome roda headless com perfil descartável e sem sandbox de namespaces, para
compatibilidade com o ambiente restrito usado na validação. O isolamento de rede
é obrigatório e não deve ser removido para rodar contra sites externos.

O fixture de configuração depende da serialização RSC da versão Next instalada.
Uma alteração incompatível faz o teste falhar sem liberar submissões reais.
Reavalie esse trecho ao atualizar o framework.

## Ensaios não incorporados

Os roteiros experimentais de Firefox/WebDriver BiDi, medições pontuais de desempenho,
checagem de snapshots específicos da migração e duplicatas dev/produção não foram
copiados indiscriminadamente. Firefox, WebKit/Safari, leitores de tela e dispositivos
reais dependem de ferramentas externas; não são pré-requisitos desta suíte.
Nenhuma dessas ferramentas é instalada automaticamente. Os resultados históricos
não substituem sua execução futura quando forem necessários.
