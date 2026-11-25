# Formulário de demonstração — integração com Supabase

Implementação local na worktree `lead-form`, branch `feat/lead-form`, sem novas
dependências. Nenhum commit, push, merge, deploy, migration ou cadastro remoto foi
realizado. A campanha Black Friday e as outras seções não foram alteradas.

## Correspondência conferida antes da implementação

| Campo do formulário / POST | Coluna de public.leads | Regra |
| --- | --- | --- |
| `nome` | `name` | Obrigatório, 2–80 caracteres |
| `whatsapp` | `whatsapp` | Obrigatório, telefone brasileiro com DDD válido; armazenado com +55 |
| `empresa` | `company` | Opcional, até 80 caracteres |
| `cidade` | `city` | Obrigatório, 2–60 caracteres |
| `tipo_local` (input `tipo`) | `property_type` | Obrigatório, opções existentes |
| `cameras` | `camera_quantity` | Obrigatório, opções existentes |
| `internet` | `internet_type` | Obrigatório, opções existentes |
| `email` | `email` | Opcional, formato validado, até 120 caracteres |
| `mensagem` | `notes` | Opcional, até 600 caracteres |
| `consentimento` | `contact_consent` | Booleano literal `true` |

Câmeras e internet eram opcionais na interface anterior. Passaram a exigir seleção
para corresponder às colunas obrigatórias informadas. Nenhum campo, opção, etapa,
breakpoint ou estilo de navegação foi removido. Rascunhos antigos incompletos
retornam à etapa que precisa ser preenchida.

`id`, `status` e `created_at` ficam a cargo dos defaults existentes no banco.
Metadados de atribuição, URL da página e data do cliente não são enviados ao
endpoint nem inseridos: não há colunas correspondentes no contrato fornecido.
O schema e as permissões informados estão documentados em
[database/schema.sql](../database/schema.sql), como referência não executável,
sem alegar um dump verificado do banco remoto.

## Arquitetura

1. `LeadForm` preserva as cinco etapas, validações, máscara, foco, progresso,
   rascunho por aba e timers originais de avanço. Um mutex síncrono impede que
   cliques/submit consecutivos iniciem solicitações concorrentes.
2. `sendLead` pede um desafio em `GET /api/leads/token`. O servidor devolve um
   timestamp, nonce aleatório e assinatura HMAC-SHA256, vinculada à origem.
   O segredo é usado apenas no servidor; a assinatura não contém a chave.
3. O cliente aguarda 2,1 segundos e faz `POST /api/leads` com JSON e
   `X-Lead-Token`. O servidor exige idade entre 2 segundos e 15 minutos.
   O período de espera também mostra o estado de carregamento. Não há retry
   automático. O timeout do cliente, incluindo desafio e confirmação, é 15 s.
4. O Route Handler valida origem, tipo e tamanho da requisição, desafio, honeypot,
   tipos dos campos, limites, consentimento e listas fechadas de opções.
   Validação de telefone/e-mail é compartilhada; o servidor valida novamente
   sem truncar números ou confiar na interface.
5. `lib/leads/server.ts`, protegido por `server-only`, lê `SUPABASE_URL` e
   `SUPABASE_SECRET_KEY` em runtime. Usa `fetch` para `POST /rest/v1/leads`,
   `apikey`, `Content-Profile: public` e `Prefer: return=minimal`.
   Não envia a chave como Bearer JWT, não faz `.select()`, upsert ou consulta.
6. Somente HTTP 201/204 da Data API confirma a inserção. A rota devolve
   HTTP 201 e `{ "ok": true }`, sem registro ou dados pessoais. O cliente
   também exige `ok === true` antes de limpar o rascunho, emitir a conversão
   permitida e exibir a confirmação.

As rotas usam o runtime Node.js padrão do Next.js 16.4.6. Com `cacheComponents`,
não declaram `runtime`; GET lê dados da requisição e não é pré-renderizado.

O transporte segue a documentação oficial de
[chaves do Supabase](https://supabase.com/docs/guides/getting-started/api-keys) e
[retorno mínimo do PostgREST](https://docs.postgrest.org/en/v13/references/api/preferences.html).

## Segurança e respostas

- Segredos somente no servidor, sem prefixos `NEXT_PUBLIC_`. Configuração pública
  contém apenas o endpoint local e os contatos comerciais já existentes.
- JSON de até 8 KiB, conferido pelo header e pelos bytes efetivamente lidos,
  inclusive em streaming; leitura limitada a 5 s. Inserção remota limitada a 8 s.
- Origem exata obrigatória no POST e checagem de Fetch Metadata. Nenhum CORS
  público habilitado. O desafio também rejeita requisições de outra origem.
- Campos desconhecidos/administrativos são rejeitados. Somente o objeto de
  inserção explícito chega ao Supabase. Textos recebem trim/NFC, campos de linha
  única têm espaços normalizados; e-mail mantém a parte local e normaliza domínio.
  Opcionais vazios/ausentes viram NULL.
- Honeypot no cliente e servidor, desafio assinado com tempo mínimo e expiração.
  Proteções sem estado funcionam entre instâncias serverless, sem Map de IPs,
  contadores em memória, coleta de IPs ou promessa de rate limit distribuído.
- Fetch remoto sem cache, sem redirecionamento, sem retry e sem repassar erros
  internos. Respostas da API usam `Cache-Control: no-store` e `nosniff`.
- Sem logs de payloads, erros remotos, dados pessoais ou credenciais.
- Apenas INSERT; RLS/permissões/configuração remotos preservados. Nenhuma rota
  de consulta, atualização ou exclusão de leads foi criada. GET de token não
  lê dados do Supabase.

| HTTP | Situação |
| --- | --- |
| 201 | Inserção confirmada |
| 400 | JSON ausente ou malformado |
| 403 | Origem, desafio ou honeypot recusado |
| 408 | Timeout lendo o corpo |
| 413 | Requisição maior que 8 KiB / tamanho declarado inválido |
| 415 | Content-Type diferente de application/json |
| 422 | Campos inválidos, inesperados ou sem consentimento |
| 502 | Falha de conexão, recusa ou resposta inesperada do Supabase |
| 503 | Configuração indisponível / falha interna |
| 504 | Timeout da inserção |

Todos os erros devolvem apenas `ok: false` e a mensagem genérica solicitada.
Métodos não implementados recebem o 405 padrão do Next.js.

## Estados da interface

O envio desabilita o botão e os campos, preserva os valores e mostra spinner,
`aria-busy` e “Enviando solicitação...”. Movimento reduzido desativa a rotação.
Erro mantém dados, etapa e rascunho e desbloqueia uma nova tentativa, com:
“Não foi possível enviar sua solicitação. Por favor, tente novamente.”

A confirmação tem ícone verde centralizado e os textos exatos solicitados.
Não há botões ou abertura de e-mail/WhatsApp. Não há sucesso otimista.
Pagehide/desmontagem abortam o transporte e cancelam timers; respostas antigas
não mudam a interface nem emitem conversões. Sem JavaScript/pré-hidratação,
campos permanecem desabilitados, sem nomes, com POST e orientação acessível.

## Limitações e decisões que dependem de autorização

O desafio e o honeypot reduzem automação simples, mas um bot pode pedir tokens,
esperar e reutilizá-los durante sua validade. Eles não são CAPTCHA, proteção de
volume ou tokens de uso único. Para limitar IPs/volume entre instâncias, será
necessária configuração do Vercel Firewall/rate limiting, ou armazenamento
compartilhado (por exemplo Redis); CAPTCHA exige provedor e novas credenciais.
Esses recursos não foram configurados sem autorização.

O mutex evita duplicação por cliques concorrentes e não há retries automáticos.
Não há idempotência persistente entre tentativas, abas ou recarregamentos.
Se a inserção ocorrer e a resposta se perder, um reenvio manual pode duplicar o
lead. Para resolver de forma atômica, a proposta é uma chave de idempotência
persistida pelo cliente com o rascunho e uma UNIQUE constraint/coluna no banco,
com contrato de confirmação seguro para repetição. Isso exige alteração remota
e autorização antes de implementar. A tabela continua usando UUID automático;
o backend não inventa sucesso em um 409 nem amplia privilégios para upsert.

Rotação da chave invalida desafios emitidos anteriormente; a próxima tentativa
obtém outro. Configurar as duas variáveis somente no ambiente servidor da Vercel
será necessário quando houver publicação autorizada. Credenciais de `.env.local`
não são publicadas por esta implementação.

A persistência real ainda depende do cadastro fictício controlado autorizado
pelo responsável. Todos os ensaios atuais usam mocks, sem inserir dados remotos.

## Validação local

Comandos e isolamento estão em [scripts/qa/README.md](../scripts/qa/README.md).
O teste de API injeta ambiente, relógio e fetch fictícios sem ler `.env.local`.
O navegador intercepta tanto o desafio quanto os POSTs; não alcança o backend
real para inserir dados. A auditoria do bundle compara os valores em memória
no processo servidor, emitindo somente resultado booleano e contagens.

### Resultados desta implementação

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou, sem erros ou avisos |
| `tsc --noEmit` | Passou |
| `npm run build` | Passou; página estática e duas rotas dinâmicas |
| `scripts/qa/leads-api.mjs` | 23/23 grupos de cenários, fetch/ambiente/relógio simulados |
| `scripts/qa/leads.mjs` | 14/14 verificações |
| `scripts/qa/form.mjs` | 67/67 verificações |
| `scripts/qa/page.mjs` | 24/24 verificações, oito larguras de 320 a 1440 px |
| `scripts/qa/interactions.mjs` | 56/56 verificações |
| `scripts/qa/black-friday.mjs` | 16/16 verificações |
| `scripts/qa/client-secrets.mjs` | 28 arquivos públicos auditados, sem exposição |
| `git diff --check` | Passou |
| `.env.local` | Ignorado pelo Git e não rastreado |

O formulário foi exercitado em carregamento, erro e sucesso a 320, 390, 768 e
1440 px. As capturas finais de sucesso a 390, 768 e 1440 px também foram
inspecionadas visualmente. Os 200 checks funcionais passaram. Não houve exceções
de aplicação/hidratação, requisições comerciais nem contatos reais nos ensaios.

Os roteiros anteriores de página/interações precisaram considerar o `<source>`
ativo de `<picture>`, a imagem de campanha oculta em mobile e o intervalo persistente
do contador Black Friday. Essas correções ficam exclusivamente no QA; o código,
os assets e as datas da campanha não foram modificados. Comparação com HTML
original não foi executada por ausência de `QA_REFERENCE_DIR`. Não houve ensaio
em dispositivos reais ou outros motores além do Chromium.

O sandbox inicialmente bloqueou o subprocesso TypeScript com EPERM; o build foi
concluído com permissão de execução local. Nenhuma configuração do Next.js foi
alterada para contornar a verificação.

## Arquivos criados e modificados

Criados:

- `app/api/leads/route.ts`: rota de inserção.
- `app/api/leads/token/route.ts`: emissão de desafio, sem acesso a registros.
- `lib/leads/server.ts`: validação de requisição, proteção e inserção no servidor.
- `lib/leads/rules.ts`: validação compartilhada de telefone e e-mail.
- `database/schema.sql`: referência documental não executável.
- `scripts/qa/leads-api.mjs`: testes isolados dos handlers.
- `scripts/qa/client-secrets.mjs`: auditoria de credenciais no conteúdo público.

Modificados:

- `components/lead-form/LeadForm.tsx`: envio, carregamento, erro e bloqueio de concorrência.
- `components/lead-form/LeadFormFields.tsx`: obrigatoriedade e erros de câmeras/internet.
- `components/lead-form/LeadFeedback.tsx`: confirmação solicitada, sem encaminhamento externo.
- `components/lead-form/LeadForm.module.css`: spinner com movimento reduzido; remoção de estilo obsoleto.
- `lib/leads/types.ts`: estados do formulário e mensagem genérica.
- `lib/leads/validation.ts`: listas obrigatórias, regras compartilhadas e restauração do rascunho.
- `lib/leads/formatting.ts`: remoção dos transportes de encaminhamento e form-urlencoded obsoletos.
- `lib/leads/transport.ts`: handshake, JSON explícito e confirmação obrigatória.
- `lib/site-config.ts`: endpoint local, contrato e timeout.
- `scripts/qa/browser.mjs`: interceptação de tokens e tratamento de sockets do proxy de bloqueio.
- `scripts/qa/config.mjs`: destino fictício interceptado e contrato atual.
- `scripts/qa/form.mjs`: estados, fluxo, erros, concorrência e responsividade.
- `scripts/qa/leads.mjs`: contratos e validações atualizados.
- `scripts/qa/page.mjs`: dimensões efetivas de picture e recursos ocultos responsivos.
- `scripts/qa/interactions.mjs`: distinção entre timers da simulação e contador de campanha.
- `scripts/qa/README.md`: comandos e cobertura atualizados.
- `README.md`: descrição atual da integração.
- `docs/lead-form.md`: arquitetura, mapeamento, segurança, limites e resultados.
