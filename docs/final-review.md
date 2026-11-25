# Revisão final da migração

Registro técnico das Etapas 1–5 e da preparação complementar aprovada antes do
versionamento. Não autoriza commit, push, merge ou publicação. Os contratos do
formulário estão em [lead-form.md](lead-form.md); os testes e comandos permanentes
estão em [scripts/qa/README.md](../scripts/qa/README.md).

## Correções concluídas

| Problema | Correção |
| --- | --- |
| Dimensões declaradas incorretas da marca | BrandImage usa as dimensões intrínsecas dos PNGs; CSS mantém os tamanhos visuais e a proporção |
| Rótulos Sim/Não sem papel semântico apropriado | role img preserva o nome acessível e a aparência |
| CTA móvel fora de landmarks | Ações flutuantes agrupadas em aside nomeado, ocultado da árvore acessível quando não contém ação visível |
| Escopo incorreto do retorno ilustrativo de imóveis | Regra movida para o CSS Module consumidor, restaurando fundo transparente e ícone branco originais |
| Ano congelado no rodapé | Fronteira cliente mínima restaura o ano do visitante, com o fallback HTML original |
| CSS de validação/configuração sem consumidores | Seletores residuais removidos sem alterar os estados visuais usados |
| Contraste insuficiente dos passos pendentes | Títulos e descrições mantêm cor/opacidade legíveis; atenuação limitada aos indicadores |

### Aviso de dimensionamento das imagens

O PNG do nome mede 720 × 116, mas recebia atributos 150 × 24. No desktop, o CSS
aplicava largura 146 px e altura automática de aproximadamente 23,52 px. O Next
comparava os inteiros renderizados: largura 146 diferente de 150, mas altura
arredondada 24 igual ao atributo 24. Isso acionava a verificação de apenas um eixo
modificado, mesmo já existindo height auto.

O componente agora declara 720 × 116 para o nome e 360 × 250 para o emblema.
Os chamadores não passam mais dimensões de exibição arredondadas. As regras CSS
continuam controlando o eixo visual e o outro eixo automático. Não houve troca de
next/image por img, supressão de aviso, recompressão dos PNGs ou alteração da marca.

O nome aparece em SiteHeader, SiteFooter e AppHomeHeader, reutilizado nas telas
HomeScreen e HeroScreen. O emblema também aparece na notificação de HeroScreen.
As sete imagens foram verificadas em oito larguras, inclusive junto aos breakpoints
980 e 380 px, sem mudança das medidas carregadas e sem novos avisos em dev/produção.

### Contraste da simulação

A correção foi expressamente aprovada para esta seção. A opacidade 0,4 deixou de
atingir os cartões/textos inteiros e passou a atingir somente os indicadores
pendentes. Estados ativados/concluídos mantêm os indicadores verdes, bordas e
fundos em gradiente originais. Deslocamentos, espaçamentos, conteúdo, tempos,
replay e preferência por movimento reduzido foram preservados.

Foram medidos os fundos reais rasterizados, inclusive gradientes, com os textos
temporariamente sem glifos apenas no navegador de QA. Amostras sólidas herdam a
composição e a opacidade dos textos. O cálculo usa luminância relativa em sRGB e
avalia a área inteira de cada retângulo de texto, sem usar a antisserrilha do glifo
como cor de referência. O código de produção não contém sondas de medição.

| Estado | Mínimo dos títulos | Mínimo das descrições |
| --- | --- | --- |
| Pendente anterior | aproximadamente 3,48:1 | aproximadamente 2,21:1 |
| Pendente corrigido | 16,69:1 | 7,91:1 |
| Parcial/concluído, incluindo gradientes | 14,93:1 | 7,08:1 |
| Movimento reduzido, concluído | 14,93:1 | 7,08:1 |

As amostras cobrem 1440, 768 e 390 px, estados estabilizados pendente, parcial e concluído,
replay e movimento reduzido. O menor resultado corrigido supera 4,5:1 para texto
normal. Capturas comparativas e medições brutas são artefatos locais, não arquivos
necessários ao checkout. O script simulation.mjs permite reproduzir as medições.

## Arquitetura, acessibilidade e desempenho

- App Router, React, TypeScript estrito e página pré-renderizada. Seções e conteúdo
  permanecem Server Components, com fronteiras cliente para interações necessárias.
- CSS Modules e estilos globais mínimos; sem Tailwind, fontes remotas ou SDKs de
  rastreamento. Inter e licença SIL OFL preservadas byte a byte.
- Observers, listeners, intervalos, timeouts e requisições têm limpeza. O formulário
  bloqueia concorrência, preserva rascunhos após falha e não confirma abertura externa
  como entrega. Nenhum backend foi criado.
- Títulos, landmarks, nomes acessíveis, alt, IDs, foco, teclado, abas, FAQ, campos,
  conteúdo oculto e reflow foram revisados. A aparência fora da simulação não foi
  alterada na preparação complementar.
- O axe verifica estados pendentes e concluídos. Fundos complexos ainda podem exigir
  conferência manual; não se declara conformidade integral WCAG ou validação com
  leitores de tela/dispositivos reais.
- As medições locais anteriores de CLS 0 e aproximadamente 148 KiB de JavaScript
  comprimido são amostras em Linux/Chrome headless, loopback e sem limitação de
  CPU/rede. Não constituem garantia de desempenho em produção.
- Os dois PNGs da marca são pequenos e reutilizam o cache. Unoptimized preserva
  qualidade/transparência; nenhum recurso foi recomprimido com perdas.

## Validação e QA permanente

As bibliotecas do formulário têm 16 grupos isolados. A suíte de formulário cobre
63 verificações; a regressão de interações inclui até 72 verificações quando a
referência original está disponível. A versão sem referência omite somente as
comparações correspondentes e informa isso explicitamente.

O conjunto permanente também verifica imagens, HTML inicial, metadados, reflow,
contraste, movimento reduzido e acessibilidade. Os scripts compartilham um único
harness, aceitam caminhos e origem local configuráveis e geram artefatos fora do
projeto. Não dependem de snapshots temporários de etapas anteriores.

Fixtures de transporte usam somente dados fictícios, e-mail reservado a teste,
número inválido fictício e POST interceptado. O servidor de referência aceita
somente leitura, com CSP e bloqueio de submissões. Não foram preservadas cópias
redundantes de roteiros dev/produção, perfis, caches, capturas ou relatórios gerados
entre as fontes dos testes.

Firefox/BiDi foi ensaiado na revisão anterior, mas seu roteiro experimental não
integra o QA permanente. Chrome/Chromium é ferramenta externa obrigatória para
os testes de navegador; a referência original e o axe são pré-requisitos adicionais
somente das suítes correspondentes. Ferramentas ausentes não são instaladas pelo QA.

Os comandos técnicos finais são npm run lint, npx tsc --noEmit, npm run build,
npm audit, git diff --check e git status --short. Relatórios brutos, logs e imagens
são locais; a reprodução é documentada por comandos permanentes em scripts/qa/.

## Configurações e limites de publicação

Permanecem dependentes de definição do domínio: metadataBase, canonical, og:url,
URLs da imagem social preservada, sitemap e robots. Metadata API, pt-BR, título,
descrição, Open Graph, Twitter Card, ícones e JSON-LD Service foram preservados.
Nenhum domínio público ou endereço comercial foi inventado.

Endpoint e WhatsApp permanecem vazios; o e-mail comercial original foi preservado.
Um endpoint futuro precisa de contrato de confirmação, CORS, validação do servidor
e eventual idempotência. Timeout/abort não desfazem POST já processado. Entrega por
mailto/WhatsApp não pode ser confirmada pela página; esses links transportam a
mensagem codificada conforme seu contrato. Política de privacidade, retenção e
operadores futuros dependem do responsável comercial.

Sem JavaScript, conteúdo principal e FAQ permanecem disponíveis, a primeira tela
do app aparece e o formulário fica desabilitado, sem campos serializáveis por GET.
As demais abas e comportamentos dinâmicos dependem de JavaScript.

## Inventário para versionamento

| Categoria | Conteúdo recomendado |
| --- | --- |
| Código | app/, components/, hooks/, lib/ |
| Recursos e licença | public/assets/img/, public/assets/fonts/, incluindo OFL-Inter.txt |
| Configuração alterada | package.json, package-lock.json e next.config.ts; versões aprovadas preservadas |
| Documentação permanente | README.md, docs/lead-form.md, este documento e scripts/qa/README.md |
| QA reutilizável | Fontes mjs em scripts/qa/; sem artefatos de execução |
| Remoções aprovadas | Favicon e SVGs demonstrativos Next/Vercel e configuração/dependências do Tailwind |

AGENTS.md, tsconfig, ESLint e .gitignore existentes são preservados. Não foram
instaladas, removidas ou atualizadas dependências na revisão/preparação final.
Dados de autoria pessoal e caminhos específicos da máquina não são necessários
à documentação permanente.

### Evidências locais

Com aprovação expressa, somente estas regras foram acrescentadas ao info/exclude
compartilhado do repositório bare, preservando todo o conteúdo preexistente:

```gitignore
/docs/reference/original/
/docs/stage-1-validation.json
```

As 29 referências visuais/manifest e o relatório histórico continuam no disco.
O .gitignore versionado não foi modificado, e nenhuma exclusão genérica foi criada.
Esses arquivos não são usados pela aplicação nem indispensáveis ao QA sem referência.
Build, dependências instaladas, tipos gerados e caches seguem as regras preexistentes.

## Parecer

Código, recursos, configurações, licenças, documentação e QA reutilizável estão
preparados para a seleção futura. O inventário inclui também as remoções do template
já aprovadas. Evidências e artefatos de execução ficam fora dessa seleção.
Nenhum git add, commit, push, merge ou deploy foi realizado. A Etapa 6 continua
condicionada à aprovação explícita. Prontidão para versionamento não substitui as
definições comerciais, de domínio e de publicação nem certifica WCAG integral.
