# CLAUDE.md — Frontend Desafio Elite Dev (Plataforma de Eventos e Ingressos)

Este arquivo orienta o desenvolvimento do frontend.

**Ordem de leitura antes de implementar qualquer coisa:**

1. [`docs/specs/000-fundacao-arquitetura.md`](docs/specs/000-fundacao-arquitetura.md) — arquitetura, decidido e aprovado.
2. O spec da feature em [`docs/specs/`](docs/specs/).
3. O `.md` correspondente em [`docs/doc-frontend/`](docs/doc-frontend/) — contratos da API, fonte da verdade.
4. [`docs/BACKLOG.md`](docs/BACKLOG.md) — a task em que você está.

Este documento não repete contratos de API nem decisões já registradas nos specs. Quando houver divergência entre este arquivo e um spec, **o spec vence** — e o CLAUDE.md deve ser corrigido no mesmo PR.

## Contexto do desafio

Projeto para o processo seletivo Elite Dev (Verzel). O avaliador já viu o resultado de colar o PDF do desafio direto numa ferramenta de IA — o enunciado é explícito sobre isso. O que está sendo avaliado não é "o sistema funciona", é **as decisões tomadas e por quê**. Isso muda como este projeto deve ser conduzido:

- Toda decisão de UI que fugir do óbvio deve ser justificada em `docs/DECISIONS.md`, não deixada implícita.
- Nada de tela "pronta de ferramenta" — ver seção **Evitar AI slop** abaixo.
- Commits ao longo dos dias, com mensagens descritivas — o histórico é parte da entrega.
- Documentar o uso de IA: quais partes, quais ferramentas, o que foi feito sem IA.

## Spec-driven development

Nenhum código antes do spec. O ciclo, por epic:

```
spec em docs/specs/  →  tasks em docs/BACKLOG.md  →  branch  →  commits atômicos  →  PR  →  marcar as tasks
```

- Cada epic tem um spec numerado com requisitos, contrato da API usado, critérios de aceite e casos de erro.
- As tasks vivem em `docs/BACKLOG.md`, agrupadas por epic, com checkbox. **Marque a task no mesmo PR que a entrega**, nunca depois.
- Descobriu trabalho novo durante a implementação? Acrescente a task ao BACKLOG em vez de fazer sem registro.
- Mudou de ideia sobre algo do spec? Atualize o spec no mesmo PR, com o motivo. Spec desatualizado é pior que spec ausente.

## Git — regras invioláveis

- **Nada direto em `main`.** Sempre branch + pull request. (A única exceção já consumada é o commit raiz de bootstrap, porque PR precisa de base.)
- Uma branch por epic: `feat/01-auth-bff`, `feat/02-ui-kit`, `docs/000-fundacao-arquitetura`.
- **Conventional commits**, atômicos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `ci`. Assunto em inglês ou português, corpo em português explicando o **porquê**, não o o quê.
- Um commit = uma mudança coerente. "wip", "ajustes" e "correções gerais" não entram.
- **Merge por rebase, nunca squash** — squash colapsaria os commits atômicos, e o histórico é avaliado.
- CI no PR: `lint`, `typecheck`, `test`, `build`. PR vermelho não entra.

## Stack

- **Framework:** Next.js (App Router) — também atua como BFF, ver Autenticação
- **Data fetching:** TanStack Query
- **Tabelas:** TanStack Table (por baixo da `DataTable` genérica)
- **Formulários:** React Hook Form + Zod
- **Estado global efêmero:** Zustand (seleção de assento no checkout, UI)
- **Estilo:** Tailwind CSS + shadcn/ui
- **HTTP client:** axios com `baseURL: "/api/v"` (fala só com o próprio Next)
- **QR (desenho):** `qrcode.react` (`QRCodeSVG`) — ver `05-ingressos-e-portaria.md`
- **QR (leitura):** `BarcodeDetector` nativo + `zxing-wasm` sob demanda no fallback
- **Testes:** Vitest + Testing Library + MSW
- **Geração de tipos:** `openapi-typescript` a partir de `http://localhost:3000/docs.json`, com o backend de pé

## Convenção de idioma

- **Código em inglês:** arquivos, pastas, variáveis, funções, tipos, componentes (`events-service.ts`, `useCreateReservation`, `SeatMap.tsx`).
- **Textos visíveis em português:** mensagens de erro, labels, toasts, textos de tela. A API já devolve `message` pronta em português na maioria dos casos (ver `06-erros-e-convencoes.md`) — priorize exibir a mensagem da API em vez de reescrevê-la.
- Erros de validação (`VALIDATION_ERROR`) trazem `details[].path`/`.message` em inglês (vêm do Zod). Nunca repasse direto ao usuário: passe por `useApiFormErrors`, que traduz por campo via `lib/field-labels.ts`.

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/login|register/
│   ├── (client)/
│   │   ├── events/page.tsx · [id]/page.tsx · [id]/checkout/page.tsx
│   │   ├── my-tickets/page.tsx
│   │   └── ticket/[code]/page.tsx        # compartilhável, público
│   ├── (organizer)/dashboard/
│   │   ├── page.tsx                      # DataTable — GET /events/mine
│   │   ├── new/page.tsx                  # busca no catálogo → POST /events
│   │   └── [id]/page.tsx                 # PATCH, publish, cancel
│   ├── (gate)/check-in/page.tsx          # scanner + input manual
│   ├── api/                              # ← o BFF
│   │   ├── auth/{login,register,logout,session}/route.ts
│   │   └── v/[...path]/route.ts          # proxy genérico para a API
│   └── layout.tsx
│
├── server/                               # server-only. NUNCA importar no client
│   ├── api-client.ts                     # fetch para a API + parse de erro
│   ├── session.ts                        # ler/gravar/limpar cookies
│   ├── refresh.ts                        # single-flight
│   └── proxy.ts
│
├── features/                             # hooks · services · components · types
│   auth · catalog · events · reservations · payment · tickets · check-in
│
├── components/
│   ├── ui/                               # shadcn/ui — gerado via CLI, não editar à mão
│   ├── form/                             # Form, FormInput, FormSelect, FormMoney…
│   ├── data-table/                       # DataTable genérica
│   ├── modal/                            # Modal + useConfirm
│   ├── feedback/                         # AsyncBoundary, EmptyState, ErrorState
│   └── layout/                           # AppShell, Sidebar, Topbar, ThemeToggle
│
├── lib/
│   ├── http-client.ts · query-client.ts · api-errors.ts
│   ├── messages.ts                       # strings pt-BR por domínio
│   ├── field-labels.ts                   # path do Zod → label pt-BR
│   └── utils.ts
│
├── stores/ui-store.ts
├── middleware.ts                         # protege rotas por papel
└── types/index.ts
```

Arquivo passando de ~200 linhas é sinal de responsabilidade demais — vale sobretudo para `SeatMap`, `DataTable` e o route handler do proxy.

## Autenticação — BFF com cookies httpOnly

Detalhes completos na seção 2 do spec 000. **Não siga a recomendação de `localStorage` do `02-autenticacao.md`** — ela descreve uma limitação da API, não do frontend. O Next tem servidor; usamos isso.

O que não pode ser esquecido:

- O browser **nunca** vê token. Cookies `vz_at`, `vz_rt`, `vz_renew_at` são `httpOnly`; só `vz_user` (`{ id, name, role }`) é legível pelo JS, e **não é credencial** — serve ao roteamento por papel e à casca da UI. Gate de UI é UX; o gate real é o `403` da API.
- `vz_rt` tem `path=/api/auth`: o proxy de dados nunca recebe o refresh token.
- **Refresh é single-flight, obrigatório, e roda no servidor.** Duas chamadas simultâneas a `/auth/refresh` derrubam todas as sessões do usuário (reuso de refresh token é tratado como roubo). Uma promessa em curso; as demais aguardam a mesma.
- **Renovação proativa** a 80% do `expiresIn`, com o instante calculado no login e gravado em `vz_renew_at`. O `401` por expiração vira caminho de exceção, não rotina.
- `401` → renova uma vez e repete; segundo `401` limpa cookies e manda ao login. `403` → **nunca** renova, mostra mensagem de permissão. Confundir os dois gera laço de logout.
- `lib/http-client.ts` **não tem** interceptor de refresh. Renovar é responsabilidade do servidor. Se você está escrevendo lógica de token no client, parou no lugar errado.
- Cadastro sempre nasce `CUSTOMER`; não construir tela de escolha de papel. `ORGANIZER` e `GATE` só existem via seed.
- Mensagem de `401` em login é idêntica para "e-mail não existe" e "senha errada" — não tentar diferenciar na UI.

## Componentização

"Componentizar ao máximo" aqui significa: **nenhuma tela reinventa o que o kit já resolve**. O epic `02` entrega o kit antes das telas, de propósito.

- **`Modal`** — semântica Bootstrap (`Modal.Header`/`Body`/`Footer`, `size`, `staticBackdrop`) sobre o Dialog do Radix, que já resolve foco preso, `Escape` e `aria-modal`. Mais `useConfirm()` imperativo para os "tem certeza?".
- **`Form` + campos** — `<Form schema={…}>` injeta o `zodResolver`; `FormInput`, `FormPassword`, `FormTextarea`, `FormSelect`, `FormDateTime`, `FormMoney` (BRL, envia número — a API espera `45.5`, não string), `FormNumber`. Nenhum `<input>` solto em tela.
- **`DataTable`** — colunas tipadas, ordenação, paginação server-side (`skip`/`take`, `take` ≤ 50), busca com debounce, visibilidade de colunas, ações inline, e os estados carregando/vazio/erro. Sem seleção em lote, agrupamento, master-detail, resize/reorder ou export: não têm consumidor no desafio.
- **`AsyncBoundary`** — carregando/erro/vazio padronizados. Toda tela de erro mostra a `message` da API e o `requestId` em letra miúda.

## Erros — tratamento único

Todo erro da API vem no formato `{ error: { code, message, details?, requestId } }` (ver `06-erros-e-convencoes.md`).

- Ramificar lógica pelo **`code`**, nunca pela `message` — mensagens mudam, códigos não.
- `VALIDATION_ERROR` → `useApiFormErrors`. `path: "(corpo)"` e caminhos sem campo correspondente vão para o erro geral do formulário, nunca somem em silêncio.
- `409` é o mais rico: o significado depende do endpoint (assento ocupado, evento cancelado, chave de idempotência reusada, reserva já paga). Tratar no hook de cada domínio, nunca num handler genérico. Na reserva, `409` **sempre** dispara refetch do mapa de assentos.
- `lib/messages.ts` centraliza fallbacks por domínio (auth, reservations, payment, checkin) e as mensagens de rede/timeout do próprio axios.

## Idempotência

- `Idempotency-Key` obrigatória na prática em `POST /events/:id/reservations` e `POST /reservations/:id/payment`.
- Uma chave por **intenção do usuário**, gerada no momento da decisão (clique em "reservar este assento"), guardada no store e reaproveitada apenas em retry da mesma tentativa. Trocar de assento = nova chave.
- `Idempotency-Replayed: true` na resposta suprime o segundo toast de sucesso — a operação não aconteceu de novo, o usuário só clicou duas vezes.

## Paginação

- `skip`/`take` (padrão 20, máx 50) em `/events`, `/events/mine`, `/reservations/mine`, `/tickets/mine`.
- Exceção: `/catalog/search` pagina com `page`, começando em 1 (segue as APIs externas).

## Estado: quem guarda o quê

| Estado | Onde | Exemplo |
| --- | --- | --- |
| Dado do servidor | TanStack Query | eventos, assentos, ingressos |
| Sessão | cookie, hidratado no boot | usuário, papel |
| Efêmero de fluxo | Zustand | assento selecionado, `Idempotency-Key`, countdown |
| Preferência de UI | Zustand + cookie | tema, sidebar recolhida |

Se veio da API, é do Query — não se copia para Zustand. Duplicar dado de servidor em store global é a origem clássica de tela desatualizada.

## Design — evitar AI slop

Referência visual: **estética AdminLTE** (densidade de informação, sidebar fixa, cards com header/body demarcados, tabelas com bordas sutis, paleta sóbria de admin clássico), implementada com Tailwind + shadcn/ui — o *espírito*, não o CSS do AdminLTE clonado. Um painel que parece feito para uso operacional real, não um dashboard genérico de SaaS.

- **Nada de gradiente roxo-azul genérico, nada de emoji como ícone, nada de sombra flutuante exagerada.** Paleta sóbria, uma cor de ação primária.
- **Densidade de dashboard, não espaçamento de landing page.** Linhas compactas, ações inline, filtros no topo.
- **Tipografia com hierarquia real**, não tudo do mesmo peso com só a cor mudando.
- Os 4 estados da portaria (`VALID`/`ALREADY_USED`/`WRONG_EVENT`/`INVALID`) merecem tela cheia de cor + ícone grande + vibração opcional — é o momento de maior tensão do fluxo (fila esperando). **Cada estado tem ícone próprio**: cor sozinha falha para daltônicos.
- Registrar em `docs/DECISIONS.md` *por que* cada escolha não-óbvia foi feita.

## Dark mode

Tema em **cookie**, não `localStorage`: o servidor lê e já renderiza a classe certa em `<html>` — sem flash de tema errado, sem mismatch de hidratação, sem script bloqueante no `<head>`. Coerente com a decisão de sessão. Três estados: `light`, `dark`, `system`. Contraste AA nos dois temas, checado nos 4 estados da portaria.

## Testes

Vitest + Testing Library + MSW, **cirúrgicos**: onde a lógica é real e o bug custa caro. Alvos definidos na seção 8 do spec 000 — single-flight, parse de `ApiError`, `useApiFormErrors`, Idempotency-Key por intenção, 4 estados da portaria, trava de 2 s do scanner, countdown, `DataTable`.

Não se testa markup trivial ("EventCard renderiza o título"): é ruído que quebra a cada ajuste de layout sem indicar defeito. O README explica **por que estes alvos** — a escolha diz mais sobre critério do que um número de cobertura.

## Performance — checklist rápido (detalhe em `07-performance.md`)

1. Refresh de sessão single-flight (crítico — ver Autenticação).
2. Idempotency-Key por intenção, não por request.
3. Travar botão de reservar e leitor de QR durante a chamada (trava de ~2 s no scanner).
4. Nunca refazer chamada por dado que já veio embutido (`tickets/mine` já traz `event`; `reservations/mine` já traz `seatLabel`).
5. Debounce de 300–500 ms na busca do catálogo e de eventos, com `AbortController` cancelando a anterior.
6. Carregar detalhe do evento + mapa de assentos em paralelo (`Promise.all`).
7. Recarregar o mapa de assentos sempre após um `409` de reserva.
8. `staleTime` por rota conforme a tabela do `07-performance.md` — atenção a `GET /events/:id/seats` com `staleTime: 0`.

## Fluxo de reserva

**Mapa de assentos, um assento por reserva.** `POST /events/:id/reservations` aceita apenas `{ seatId }` — não existe reserva por quantidade ("pista") nesta API, e prometer isso no README seria furo de entrega.

## Dados de teste (seed do backend)

| Papel | E-mail | Senha |
| --- | --- | --- |
| `ORGANIZER` | `organizador@verzel.test` | `organizador123` |
| `CUSTOMER` | `cliente1@verzel.test` | `cliente123` |
| `CUSTOMER` | `cliente2@verzel.test` | `cliente123` |
| `GATE` | `portaria@verzel.test` | `portaria123` |

O seed já inclui um evento publicado com 30 assentos e um ingresso válido — não é preciso criar nada manualmente para navegar todos os fluxos.

## Ambiente

```bash
API_URL=http://localhost:3000     # server-only: sem NEXT_PUBLIC_, não entra no bundle
SESSION_COOKIE_SECURE=false       # true em produção
PORT=3001                         # a :3000 é do backend
```

O front roda na `:3001`. Como o BFF fala com a API de servidor para servidor, **CORS deixa de ser problema** — mas a porta ainda precisa mudar, senão colide com o backend.

Backend sobe com:
```bash
docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev
```

`GET /health` respondendo `degraded` significa Redis fora: reservas continuam funcionando, mas idempotência e rate limit ficam suspensos. É o primeiro lugar a olhar antes de suspeitar do frontend.
