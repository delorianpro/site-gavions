# Gavions — migração para Next.js

Migração do site estático Gavions para App Router, React e TypeScript.
Esta worktree contém a base, a estrutura visual e as interações: cabeçalho, 15 seções
na ordem original, rodapé, ilustrações SVG e as cinco telas do app. O conteúdo
é pré-renderizado por Server Components, com Inter local e estilos específicos
em CSS Modules.

As cinco abas têm navegação por clique, setas, Home e End. Cabeçalho, animações
de entrada e CTA móvel respondem à rolagem e à visibilidade. A simulação inicia
com o observer original de limiar 0,4 e preserva os tempos de 30, 1700, 2300,
2900, 3500, 4100, 4700 e 9000 ms; o replay cancela a execução anterior.

O conteúdo e as telas ilustrativas continuam em Server Components, passados como
filhos às fronteiras cliente. Hooks compartilham hidratação, media queries,
movimento reduzido e observação de visibilidade. Sem JavaScript, o conteúdo não é
ocultado por animações; a primeira tela do app e o FAQ nativo permanecem disponíveis.

O formulário preserva as cinco etapas, máscara, progresso e rascunho por aba.
`POST /api/leads` valida e normaliza os dados no servidor e faz INSERT no Supabase
com retorno mínimo. A confirmação só aparece após a inserção; erros preservam os
campos. O envio usa proteção básica contra automação e bloqueio de cliques
concorrentes. As credenciais ficam exclusivamente no servidor em `.env.local`.

O adaptador de métricas filtra os eventos originais sem instalar rastreadores.
Contratos, correções autorizadas e limites estão em [docs/lead-form.md](docs/lead-form.md).

## Desenvolvimento e validação

```bash
npm run dev -- --hostname 127.0.0.1
npm run lint
npx tsc --noEmit
npm run build
npm audit
```

Os estilos de componentes usam CSS Modules (`*.module.css`). O arquivo
`app/globals.css` contém somente tokens e regras globais de base.
Não há Tailwind, fontes remotas ou SDKs de rastreamento. O backend de leads usa
a Data API do Supabase, sem dependências adicionais.

## Recursos preservados

- `public/assets/img/`: marca, favicons, ícone Apple e imagem social originais.
- `public/assets/fonts/`: Inter variável e licença SIL OFL 1.1.
- `app/layout.tsx`: fonte via `next/font/local`, idioma `pt-BR`, metadados,
  viewport e JSON-LD preservados do original.

Nenhum domínio, canonical ou endereço público definitivo foi definido.
A imagem `public/assets/img/og-image.png` está preservada; sua URL de Open Graph
será configurada quando o domínio for informado.

## Referência visual

As capturas em `docs/reference/original/` foram obtidas antes das alterações,
com o original servido em modo somente leitura e isolado de destinos externos.
O `manifest.json` registra navegador, viewports, requisições e erros observados.

| Perfil | Viewport |
| --- | --- |
| Desktop | 1440 × 1000 |
| Tablet horizontal | 1024 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |
| Mobile estreito | 320 × 740 |

Cada perfil possui captura da área visível e da página inteira. Desktop,
tablet e mobile também possuem as cinco abas do app e o formulário vazio.
São viewports de navegador, sem emulação específica de aparelho. Para tornar
as imagens comparáveis, as seções foram reveladas por rolagem, as transições
concluídas e as animações CSS contínuas pausadas em 2500 ms.

O navegador usou perfil separado, bloqueio de requisições externas, apenas
GET/HEAD locais, CSP restritiva e bloqueio de submissões e links externos.
Nenhum formulário foi enviado e nenhum aplicativo de e-mail foi aberto.

## Organização do código

- `app/page.tsx`: composição do cabeçalho, das seções e do rodapé.
- `components/layout/`: cabeçalho, rodapé e apresentação dos CTAs flutuantes.
- `components/sections/`: as 15 seções e seus módulos de estilos próprios.
- `components/app-preview/`: moldura, cabeçalhos, navegação, cenas e telas do app.
- `components/icons/`: símbolos SVG únicos e ícones tipados que os referenciam.
- `components/ui/`: botões, cartões, títulos de seção, imagens da marca e estilos
  compartilhados pelos componentes.
- `components/lead-form/`: apresentação e controle das cinco etapas e retornos.
- `lib/leads/`: tipos, validação, formatação, transporte e backend exclusivo do servidor.
- `app/api/leads/`: inserção de leads e emissão do desafio assinado.
- `database/schema.sql`: referência documental do schema e das permissões informados.
- `lib/site-config.ts` e `lib/analytics.ts`: configuração e eventos filtrados.

Os seletores compartilhados entre componentes usam atributos `data-*` locais
ao componente ancestral, preservando as regras do original sem classes globais.
Os hooks em `hooks/` compartilham hidratação, media queries, visibilidade, rascunho
e atribuição. Não há rastreadores instalados.

## QA reutilizável

Os comandos e pré-requisitos estão em [scripts/qa/README.md](scripts/qa/README.md).
A suíte usa dados fictícios, bloqueio de contatos externos e destinos interceptados.
Caminhos, origem e portas locais são configuráveis; os artefatos são gerados fora
do checkout. Não há instalação automática de ferramentas.

As capturas históricas em `docs/reference/original/` e o relatório
`docs/stage-1-validation.json` foram preservados localmente e excluídos pelo
`info/exclude` compartilhado, com duas regras específicas autorizadas. Eles não
são necessários para executar a aplicação. O `.gitignore` versionado foi preservado.

A revisão técnica, os resultados e os limites de publicação estão em
[docs/final-review.md](docs/final-review.md). Nenhum commit, push ou deploy foi
realizado durante a migração; o versionamento depende de aprovação separada.
