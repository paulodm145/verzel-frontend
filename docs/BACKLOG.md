# Backlog

Progresso do projeto, agrupado por epic. Derivado de
[`specs/000-fundacao-arquitetura.md`](specs/000-fundacao-arquitetura.md).

**Como usar**

- Marque a task **no mesmo PR que a entrega**, nunca depois.
- Descobriu trabalho novo durante a implementação? Acrescente a task aqui em
  vez de fazer sem registro.
- Cada epic = uma branch = um PR. O plano detalhado (passo a passo, com testes)
  fica em [`plans/`](plans/) e é escrito **quando o epic começa**, não antes —
  plano escrito com semanas de antecedência nasce desatualizado.

| Epic | Branch | Plano | Status |
|---|---|---|---|
| [00 — Fundação](#00--fundação) | `feat/00-fundacao` | [plano](plans/2026-08-13-00-fundacao.md) | ✅ 11/11 |
| [01 — Auth BFF](#01--auth-bff) | `feat/01-auth-bff` | — | ✅ 9/9 |
| [02 — UI kit](#02--ui-kit) | `feat/02-ui-kit` | — | ⬜ 0/10 |
| [03 — Catálogo e eventos](#03--catálogo-e-eventos) | `feat/03-eventos` | — | ⬜ 0/6 |
| [04 — Reserva e pagamento](#04--reserva-e-pagamento) | `feat/04-reserva` | — | ⬜ 0/7 |
| [05 — Ingressos](#05--ingressos) | `feat/05-ingressos` | — | ✅ 4/4 |
| [06 — Portaria](#06--portaria) | `feat/06-portaria` | — | ⬜ 0/6 |
| [07 — Dashboard organizador](#07--dashboard-organizador) | `feat/07-dashboard` | — | ⬜ 0/6 |
| [08 — Entrega](#08--entrega) | `docs/08-entrega` | — | ⬜ 0/4 |

**Nota sobre a ordem.** O epic `02` (UI kit) entra **antes de qualquer tela de
produto**. Por isso as telas de login e cadastro estão em `02`, não em `01`:
o epic `01` entrega a infraestrutura de sessão (BFF, cookies, middleware,
hooks), e as telas nascem já consumindo o kit — em vez de nascerem com markup
solto e serem refeitas depois.

---

## 00 — Fundação

Scaffold, ferramental, tema e casca da aplicação. Sem tela de produto.
Spec: [seções 3, 5, 9, 10](specs/000-fundacao-arquitetura.md).

- [x] **00.1** Scaffold do Next.js (App Router, TypeScript, Tailwind, `src/`, alias `@/*`), rodando na porta 3001
- [x] **00.2** ESLint + Prettier com ordenação de imports; scripts `lint`, `format`, `typecheck`
- [x] **00.3** Vitest + Testing Library + MSW + jsdom; script `test`; teste de fumaça verde
- [x] **00.4** `shadcn/ui` inicializado com tokens de cor sóbrios (AdminLTE), light e dark, contraste AA
- [x] **00.5** Tema por cookie: provider server-side, `ThemeToggle`, três estados (`light`/`dark`/`system`), sem flash
- [x] **00.6** `AppShell`: sidebar fixa, topbar e área de conteúdo, com densidade de painel
- [x] **00.7** CI no GitHub Actions: `lint`, `typecheck`, `test`, `build` a cada PR
- [x] **00.8** `.env.example` e seção "como rodar" no README (o README completo é o epic 08)
- [x] **00.9** `lib/api-errors.ts`: classe `ApiError` e parse de `{ error: { code, message, details, requestId } }`, com testes
- [x] **00.10** `lib/query-client.ts`: `QueryClient` com `staleTime` por rota conforme `07-performance.md` (atenção: `seats` = 0)
- [x] **00.11** `lib/messages.ts` e `lib/field-labels.ts`: esqueleto de strings pt-BR por domínio

**Pronto quando:** `npm run lint && npm run typecheck && npm run test && npm run build` passam, a casca abre nos dois temas sem flash, e o CI está verde no PR.

---

## 01 — Auth BFF

Sessão em cookies `httpOnly`, com o Next atuando como BFF.
Spec: [seção 2](specs/000-fundacao-arquitetura.md).

- [x] **01.1** `server/api-client.ts`: fetch de servidor para a API, injeta `Bearer`, converte erro em `ApiError`
- [x] **01.2** `server/session.ts`: gravar, ler e limpar `vz_at`, `vz_rt`, `vz_renew_at`, `vz_user`, com as flags corretas (`path=/api/auth` no `vz_rt`)
- [x] **01.3** `server/refresh.ts`: single-flight, com teste provando que duas chamadas concorrentes geram **um** POST a `/auth/refresh`
- [x] **01.4** `server/proxy.ts`: renovação proativa por `vz_renew_at`, retry único em `401`, `403` sem renovar, allowlist de cabeçalhos, `Idempotency-Key` na ida e `Idempotency-Replayed` na volta
- [x] **01.5** Route handlers `/api/auth/login`, `/register`, `/logout`, `/session` (com reidratação via `/auth/me` quando faltar `vz_user`)
- [x] **01.6** Route handler `/api/v/[...path]`: proxy genérico para o resto da API
- [x] **01.7** `lib/http-client.ts`: axios com `baseURL: "/api/v"`, interceptor de `ApiError` e redirecionamento em `401` — **sem** lógica de token
- [x] **01.8** `features/auth`: service, `useLogin`, `useRegister`, `useLogout`, `useSession`
- [x] **01.9** `middleware.ts`: protege por papel; sem sessão vai a `/login?next=…`, papel errado vai a `/403`

**Pronto quando:** login pela API real grava os cookies, nenhum token aparece em `document.cookie` nem no bundle, o refresh proativo dispara antes do `401`, e os testes de concorrência e de `403` passam.

---

## 02 — UI kit

Os componentes que todas as telas consomem. Entra antes das telas de produto.
Spec: [seção 4](specs/000-fundacao-arquitetura.md).

- [ ] **02.1** `Modal` com `Modal.Header`/`Body`/`Footer`, `size` (`sm`/`md`/`lg`/`xl`) e `staticBackdrop`, sobre o Dialog do Radix
- [ ] **02.2** `useConfirm()` imperativo, com tom `destructive`
- [ ] **02.3** `<Form>` com `zodResolver` e contexto; `FormInput`, `FormPassword`
- [ ] **02.4** `FormSelect`, `FormTextarea`, `FormNumber`, `FormMoney` (BRL, envia número), `FormDateTime` (ISO UTC)
- [ ] **02.5** `useApiFormErrors` + `lib/field-labels.ts`: `details[].path` vira erro de campo traduzido; `(corpo)` e caminhos órfãos vão ao erro geral
- [ ] **02.6** `DataTable` base: colunas tipadas, ordenação, paginação server-side (`skip`/`take`, `take` ≤ 50), estados carregando/vazio/erro
- [ ] **02.7** `DataTable` toolbar: busca com debounce, visibilidade de colunas, `rowActions` inline
- [ ] **02.8** `AsyncBoundary`, `EmptyState`, `ErrorState` (mostrando `message` da API e `requestId`)
- [ ] **02.9** Telas de login e cadastro — primeiros consumidores do kit
- [ ] **02.10** Tela `/403` de permissão insuficiente

**Pronto quando:** dá para logar e cadastrar pela UI, o kit tem testes de `Modal`, `useApiFormErrors` e `DataTable`, e nenhuma tela tem `<input>` solto.

---

## 03 — Catálogo e eventos

Spec de feature a escrever: `specs/003-eventos.md`.
Contratos: [`03-eventos-e-catalogo.md`](doc-frontend/03-eventos-e-catalogo.md).

- [ ] **03.1** `features/events`: service, types e `useEvents` (`GET /events`, paginado)
- [ ] **03.2** Lista `/events` com `EventCard` e paginação
- [ ] **03.3** `EventFilters`: busca com debounce de 300–500 ms e `AbortController` cancelando a anterior
- [ ] **03.4** `useEvent` e detalhe `/events/[id]`
- [ ] **03.5** `useSeatMap` com `staleTime: 0` e `SeatMap` agrupado por fileira
- [ ] **03.6** Detalhe e mapa carregados em paralelo; refetch ao focar a janela

**Pronto quando:** a listagem pagina, a busca não dispara uma requisição por tecla, e o mapa nunca serve assento vendido a partir de cache.

---

## 04 — Reserva e pagamento

Spec de feature a escrever: `specs/004-reserva.md`.
Contratos: [`04-reserva-e-pagamento.md`](doc-frontend/04-reserva-e-pagamento.md).

- [ ] **04.1** `features/reservations`: service e store com `Idempotency-Key` **por intenção** (trocar de assento gera outra), com testes
- [ ] **04.2** `useCreateReservation`: botão travado durante a chamada; `409` sempre refaz o mapa de assentos
- [ ] **04.3** `SeatPicker` e fluxo de checkout
- [ ] **04.4** `ReservationCountdown` a partir de `expiresAt`, desaparecendo ao expirar, com testes
- [ ] **04.5** `features/payment`: service e `useSimulatePayment` com chave nova
- [ ] **04.6** `PaymentSimulator` com `APPROVED`/`REFUSED`; `Idempotency-Replayed: true` suprime o segundo toast
- [ ] **04.7** `useMyReservations` e `useCancelReservation` (usa `seatLabel` embutido, não refaz o mapa)

**Pronto quando:** duplo clique em reservar não cria duas reservas, assento ocupado por outra sessão fica vermelho após o `409`, e o countdown expira sozinho.

---

## 05 — Ingressos

Spec de feature a escrever: `specs/005-ingressos.md`.
Contratos: [`05-ingressos-e-portaria.md`](doc-frontend/05-ingressos-e-portaria.md).

- [x] **05.1** `features/tickets`: service e `useMyTickets` usando o `event` embutido — **sem** chamar `/events/:id`
- [x] **05.2** `TicketCard` e página `/my-tickets`
- [x] **05.3** `QRCodeDisplay` com `QRCodeSVG`, `level="M"`, 256–320 px
- [x] **05.4** `useTicketByCode` e página pública `/ticket/[code]`, compartilhável sem sessão

**Pronto quando:** a aba de rede mostra **uma** requisição ao abrir `/my-tickets`, e `/ticket/[code]` abre em janela anônima.

---

## 06 — Portaria

Spec de feature a escrever: `specs/006-portaria.md`.

- [ ] **06.1** `features/check-in`: service e `useValidateTicket` (`POST /gate/validate` responde sempre 200 — o hook nunca lança)
- [ ] **06.2** `ValidationResult`: 4 estados em tela cheia, cada um com cor **e** ícone próprios, contraste AA nos dois temas, com testes
- [ ] **06.3** `QRScanner` com `BarcodeDetector` nativo: ciclo de vida da câmera e trava de 2 s entre leituras, com testes
- [ ] **06.4** Fallback `zxing-wasm` carregado sob demanda, atrás da mesma interface
- [ ] **06.5** `ManualCodeInput` sempre visível, com máscara `TKT-XXXX-XXXX-XXXX`
- [ ] **06.6** Vibração e som opcionais na confirmação

**Pronto quando:** ler o mesmo QR duas vezes em menos de 2 s não mostra "já utilizado" logo após "liberado", e a tela é legível a um braço de distância.

---

## 07 — Dashboard organizador

Spec de feature a escrever: `specs/007-dashboard.md`.

- [ ] **07.1** `useMyEvents`, definição de colunas e dashboard sobre a `DataTable`
- [ ] **07.2** `features/catalog`: `useCatalogSearch` (mínimo 2 caracteres, debounce, `staleTime` 5 min, `page` começando em **1**)
- [ ] **07.3** `CatalogSearchResults` e `/dashboard/new` criando via `POST /events`
- [ ] **07.4** `EventForm` de criar e editar, com `FormMoney` e `FormDateTime`
- [ ] **07.5** `/dashboard/[id]` com `PATCH`
- [ ] **07.6** Publicar e cancelar via `useConfirm`, invalidando `GET /events`

**Pronto quando:** o organizador cria um evento a partir do catálogo, publica, e o evento aparece na listagem pública.

---

## 08 — Entrega

- [ ] **08.1** README: badges de tecnologia, como rodar, decisões, estratégia de testes e próximos passos (E2E com Playwright)
- [ ] **08.2** `DECISIONS.md` consolidado, com o porquê de cada escolha não-óbvia
- [ ] **08.3** `docs/USO-DE-IA.md`: o que foi feito com IA, com quais ferramentas, e o que foi feito sem
- [ ] **08.4** Revisão final: `lint`, `typecheck`, `test`, `build`, navegação por teclado e conferência contra o enunciado

**Pronto quando:** alguém clona o repositório, segue o README e chega a um check-in validado sem perguntar nada.
