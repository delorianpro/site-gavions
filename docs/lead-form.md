# Formulário de leads — Etapa 4

Implementação React/TypeScript sem backend, novas dependências ou SDKs de métricas.
A página e as seções continuam Server Components. `LeadFormCard` compõe a fronteira
cliente `LeadForm`; `LeadFormFields` e `LeadFeedback` pertencem ao mesmo grafo cliente.
`TrackedAnchor` é uma fronteira pequena para os CTAs que emitem eventos. As abas e
a simulação usam suas fronteiras cliente já existentes.

## Responsabilidades

| Arquivo | Responsabilidade |
| --- | --- |
| `components/lead-form/LeadForm.tsx` | Etapas, foco, erros, composição, timers, mutex de submissão, estados e cancelamento |
| `LeadFormFields.tsx` | Campos, opções e mensagens originais; inputs controlados e ARIA |
| `LeadFeedback.tsx` | Recebimento confirmado ou encaminhamento ainda não confirmado |
| `hooks/useLeadDraft.ts` | Rascunho por aba, restauração após hidratação e persistência tolerante a bloqueio |
| `hooks/useLeadAttribution.ts` | Captura e restauração das origens permitidas |
| `lib/leads/types.ts` | Contratos dos campos, transportes, respostas e estados |
| `lib/leads/validation.ts` | Obrigatoriedade, validação, completude e saneamento do rascunho |
| `lib/leads/formatting.ts` | Telefone, payload, mensagem comercial e codificações |
| `lib/leads/transport.ts` | POST, contrato de confirmação, timeout e cancelamento |
| `lib/site-config.ts` | Destinos comerciais preservados e configuração técnica tipada |
| `lib/analytics.ts` | Adaptador com listas permitidas e isolamento dos coletores |

## Experiência preservada

As etapas são `contato`, `local`, `estrutura`, `detalhes`, `confirmacao`.
Nome e cidade exigem dois caracteres após trim; telefone aceita DDD e 10/11
algarismos; tipo de local e consentimento são obrigatórios. E-mail é validado
quando preenchido. Empresa, câmeras, internet, e-mail e mensagem são opcionais.
Campos, opções, limites, títulos e mensagens de validação mantêm o original.

Continuar e Enter validam a etapa; Voltar mantém os valores. Textarea preserva
Enter como quebra de linha. O foco vai ao primeiro campo da etapa ou ao primeiro
erro, com associação `aria-describedby` e anúncio do progresso. A confirmação
não envia automaticamente.

Com todos os campos da etapa completos, o avanço aguarda 1400 ms para texto ou
450 ms para rádio. Empresa é a exceção original: pode estar vazia. Estrutura e
detalhes só avançam automaticamente quando completos; Continuar permite pulá-los.
Composição, edição posterior, navegação manual, saída do formulário, blur da
janela, visibilitychange, pagehide e desmontagem cancelam timers pendentes.
Timers também conferem versão, etapa e completude antes de executar.

## Persistência e atribuição

- `dlp_lead_draft_v1:<pathname>` mantém `{ step: nomeDaEtapa, fields: {...} }`.
- `dlp_origem` mantém UTMs (`source`, `medium`, `campaign`, `term`, `content`),
  `gclid`, `fbclid`, `referrer` e `landing`.

Nenhuma chave nova de armazenamento pessoal foi introduzida. O honeypot não é
persistido. Dados restaurados passam por checagem de tipos, limites, máscara e
listas de opções; a etapa retrocede se os obrigatórios anteriores forem inválidos.
Armazenamento bloqueado ou JSON inválido não interrompe o formulário. A restauração
ocorre após a hidratação; a renderização inicial é determinística.

Valores de atribuição são limitados a 200 caracteres (300 para URL inicial e
referência). Parâmetros atuais substituem os correspondentes armazenados; a URL
inicial e a referência já armazenadas são preservadas. Dados não permitidos no
objeto de origem são descartados.

Rascunhos permanecem após erros, cancelamento e abertura de aplicativos externos.
Somente confirmação do endpoint remove o rascunho e impede que pagehide o recrie.

## Configuração e contratos de envio

`lib/site-config.ts` preserva exatamente os destinos comerciais originais:
endpoint vazio, formato JSON, WhatsApp vazio e `delorianpro@gmail.com`.
Rodapé, CTA de WhatsApp e formulário consultam essa configuração. Nada foi
configurado para serviços adicionais. Configuração entregue ao navegador é
pública: não comporta credenciais ou segredos.

Prioridade: endpoint configurado; na ausência dele, WhatsApp; depois e-mail.
Nenhum destino mostra aviso e mantém o formulário utilizável. Falha de endpoint
permite tentar novamente e, quando disponível, escolher explicitamente um canal
alternativo. Nenhum fallback é aberto automaticamente após uma falha assíncrona.

O endpoint recebe exclusivamente POST com os campos:

```
nome, whatsapp, email, empresa, cidade, tipo_local, cameras, internet,
mensagem, consentimento: true, origem, pagina, enviado_em
```

Telefone normalizado como `+55` + DDD/número; strings textuais são aparadas.
`pagina` tem até 300 caracteres e `enviado_em` é ISO 8601.

- `leadEndpointFormat: "json"`: JSON, `Content-Type: application/json`,
  `Accept: application/json`.
- `leadEndpointFormat: "form"`: `URLSearchParams`; o navegador define
  `application/x-www-form-urlencoded;charset=UTF-8`; atribuição achatada em
  `origem_utm_source`, `origem_landing` etc. Consentimento serializado como `true`.
- Nenhuma API Route, Server Action, banco, CRM ou proxy foi criado. Um endpoint
  externo futuro precisará aceitar CORS, incluindo eventual preflight JSON.

`responseContract: { kind: "http-status" }` preserva o contrato original: resposta
HTTP 2xx confirma o recebimento. Se o serviço usar confirmação na resposta,
configure `{ kind: "json", field: "ok", value: true }` (exemplo de contrato,
sem endpoint cadastrado). Apenas HTTP 2xx com o valor exato confirma; JSON inválido,
resposta vazia ou valor divergente falham. Não há endpoint real para validar
um contrato de resposta mais específico nesta etapa.

`requestTimeoutMs: 10000` é o limite técnico adotado. Abrange também a leitura
do JSON de confirmação. O usuário pode cancelar; pagehide e desmontagem abortam
requisições. Os listeners e timers são removidos em todos os resultados. Um mutex
síncrono bloqueia cliques/submit concorrentes; respostas antigas após desmontagem
não alteram a tela nem emitem conversões.

WhatsApp usa `https://wa.me/<número>?text=...`; e-mail usa `mailto:` com assunto e
corpo originais. Ambos exigem ação do usuário; a tentativa de abertura usa
`noopener,noreferrer`, com link explícito para repetir e opção de voltar.
Os dados não são adicionados à URL do site ou enviados por GET pelo formulário.
Os links de encaminhamento **contêm a mensagem codificada**, como exige o contrato
original de `mailto:`/WhatsApp. Isso é distinto de confirmação de entrega; remover
os dados desses links exigiria outro transporte e aprovação específica.

## Correções e diferenças autorizadas

- Antes da hidratação e sem JavaScript, o fieldset fica desabilitado e os campos
  não têm `name`; FormData fica vazio. Form usa POST e os botões são `type=button`.
  Uma mensagem noscript orienta ativar JavaScript. Não há fallback de envio sem JS.
- "Pedido recebido!" aparece somente após confirmação conforme o contrato acima.
  Abertura externa mostra "Envio pelo e-mail/WhatsApp" e informa que o recebimento
  ainda não foi confirmado; rascunho preservado e nenhuma conversão emitida.
- Honeypot preenchido bloqueia o envio com mensagem genérica e preserva o rascunho,
  em vez de simular recebimento bem-sucedido.
- Falhas, timeout e cancelamento têm mensagens distintas, mantêm os dados e
  desbloqueiam a tentativa. Cancelar envio e escolher fallback são ações explícitas.
- E-mail usa abertura por ação do usuário e link de repetição, sem navegar a página
  para uma URI externa. O navegador/sistema pode bloquear ou não ter aplicativo.

A composição das cinco etapas preserva dimensões e estilos; o fieldset técnico
usa `display: contents`. Mudanças visuais ficam nos estados de erro/encaminhamento
que precisam comunicar corretamente essas correções.

## Métricas sem rastreadores

O adaptador só repassa eventos a coletores **já existentes**, quando disponíveis:
`dataLayer.push`, `gtag` e `fbq`. Não cria coletores, carrega scripts, registra SDKs
nem envia requisições por conta própria. Falhas de um coletor não afetam os demais.

| Evento | Payload permitido | Disparo |
| --- | --- | --- |
| `cta_click` | `cta`: identificador original permitido | Clique em CTA rastreável |
| `app_tab` | `tab`: um dos cinco `t-*` | Seleção por clique ou teclado |
| `sim_replay` | vazio | Replay escolhido pelo usuário |
| `generate_lead` | `method: "endpoint"`, `tipo_local` permitido | Somente confirmação do endpoint |
| `lead_fallback` | `method: "whatsapp"` ou `"email"` | Usuário escolhe o canal após falha |

No Meta, somente `generate_lead` vira `track/Lead`; os demais são `trackCustom`.
O adaptador filtra chaves/valores em runtime. Nunca repassa nome, telefone,
e-mail, mensagem, URLs, origem, payload do pedido ou erros de transporte.
Aberturas externas não emitem `generate_lead`; `lead_fallback` não é disparado
apenas por mostrar a alternativa, diferindo intencionalmente do original.

## Limites remanescentes

Não há confirmação possível de entrega de e-mail/WhatsApp. Timeout/abort não
asseguram que um servidor remoto não tenha processado um POST já recebido;
idempotência entre tentativas exige contrato de backend, fora desta etapa.
A configuração real do endpoint, seu contrato, CORS e eventual número comercial
continuam dependendo de definição comercial. Nenhum contato real foi realizado.
Os testes reutilizáveis e seus pré-requisitos estão em
[QA local](../scripts/qa/README.md). Relatórios, perfis e capturas são gerados em
diretório externo configurável e não são necessários ao funcionamento da aplicação.
