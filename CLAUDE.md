# CLAUDE.md — Frontend Desafio Elite Dev (Plataforma de Eventos e Ingressos)

Este arquivo orienta o desenvolvimento do frontend. A API já está pronta e documentada em `docs/documentação-frontend/` — este documento não repete os contratos em detalhe, referencia-os. Antes de implementar qualquer feature, leia o `.md` correspondente naquela pasta.

## Contexto do desafio

Projeto para o processo seletivo Elite Dev (Verzel). O avaliador já viu o resultado de colar o PDF do desafio direto numa ferramenta de IA — o enunciado é explícito sobre isso. O que está sendo avaliado não é "o sistema funciona", é **as decisões tomadas e por quê**. Isso muda como este projeto deve ser conduzido:

- Toda decisão de UI que fugir do óbvio deve ser justificada no README (ou num `DECISIONS.md`), não deixada implícita.
- Nada de tela "pronta de ferramenta" — ver seção **Evitar AI slop** abaixo.
- Commits ao longo dos dias, com mensagens descritivas — o histórico é parte da entrega.
- Documentar o uso de IA: quais partes, quais ferramentas, o que foi feito sem IA.

## Stack

- **Framework:** Next.js (App Router)
- **Data fetching:** TanStack Query
- **Tabelas:** TanStack Table (dashboard do organizador)
- **Estado global efêmero:** Zustand (auth, seleção de assento durante o checkout, UI)
- **Estilo:** Tailwind CSS + shadcn/ui
- **HTTP client:** axios (preferência explícita — a documentação da API sugere `fetch`, mas o projeto usa axios com hooks customizados por cima)
- **QR Code:** `qrcode.react` (`QRCodeSVG`) — ver `05-ingressos-e-portaria.md` para parâmetros de tamanho/correção
- **Geração de tipos:** `openapi-typescript` a partir de `http://localhost:3000/docs.json`, quando o backend estiver de pé

## Convenção de idioma

- **Código em inglês:** arquivos, pastas, variáveis, funções, tipos, componentes (`events-service.ts`, `useCreateReservation`, `SeatMap.tsx`).
- **Textos visíveis em português:** mensagens de erro, labels, toasts, textos de tela. A API já devolve `message` pronta em português na maioria dos casos (ver `06-erros-e-convencoes.md`) — priorize exibir a mensagem da API em vez de reescrevê-la, exceto onde uma tradução mais amigável for combinada com o time.
- Erros de validação (`VALIDATION_ERROR`) trazem `details[].path`/`.message` em inglês (vêm do Zod) — esses precisam de um mapa de tradução por campo de formulário, não repassar direto pro usuário.

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (client)/
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── checkout/page.tsx
│   │   ├── my-tickets/
│   │   │   └── page.tsx
│   │   └── ticket/[code]/page.tsx        # link de compartilhamento — GET /tickets/:code, público
│   ├── (organizer)/
│   │   └── dashboard/
│   │       ├── page.tsx                  # TanStack Table — GET /events/mine
│   │       ├── new/page.tsx              # busca no catálogo → POST /events
│   │       └── [id]/page.tsx             # PATCH, publish, cancel
│   ├── (gate)/
│   │   └── check-in/page.tsx             # scanner + input manual — POST /gate/validate
│   └── layout.tsx
│
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useRefreshSession.ts       # single-flight, ver seção Autenticação
│   │   │   └── useCurrentUser.ts          # GET /auth/me, só no boot
│   │   ├── services/
│   │   │   └── auth-service.ts
│   │   ├── store.ts                       # zustand: user, accessToken (em memória), role
│   │   └── types.ts
│   ├── catalog/
│   │   ├── hooks/
│   │   │   └── useCatalogSearch.ts        # debounce 300–500ms, min. 2 chars, staleTime 5min
│   │   ├── services/
│   │   │   └── catalog-service.ts
│   │   └── components/CatalogSearchResults.tsx
│   ├── events/
│   │   ├── hooks/
│   │   │   ├── useEvents.ts               # GET /events (público)
│   │   │   ├── useEvent.ts                # GET /events/:id
│   │   │   ├── useMyEvents.ts             # GET /events/mine
│   │   │   ├── useSeatMap.ts              # GET /events/:id/seats, staleTime 0
│   │   │   ├── useCreateEvent.ts
│   │   │   ├── useUpdateEvent.ts
│   │   │   └── usePublishOrCancelEvent.ts
│   │   ├── services/
│   │   │   └── events-service.ts
│   │   ├── components/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventFilters.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── SeatMap.tsx                # agrupa por Object.groupBy(seats, s => s.label[0])
│   │   └── types.ts
│   ├── reservations/
│   │   ├── hooks/
│   │   │   ├── useCreateReservation.ts    # gera Idempotency-Key por intenção, não por request
│   │   │   ├── useMyReservations.ts
│   │   │   └── useCancelReservation.ts
│   │   ├── services/
│   │   │   └── reservations-service.ts
│   │   ├── store.ts                        # assento selecionado, countdown de expiresAt
│   │   ├── components/
│   │   │   ├── SeatPicker.tsx
│   │   │   └── ReservationCountdown.tsx    # 10min, some ao expirar
│   │   └── types.ts
│   ├── payment/
│   │   ├── hooks/
│   │   │   └── useSimulatePayment.ts       # nova Idempotency-Key, expõe botão APPROVED/REFUSED
│   │   ├── services/
│   │   │   └── payment-service.ts
│   │   └── components/PaymentSimulator.tsx
│   ├── tickets/
│   │   ├── hooks/
│   │   │   ├── useMyTickets.ts             # traz event embutido — nunca refetch /events/:id
│   │   │   └── useTicketByCode.ts          # GET /tickets/:code, público
│   │   ├── services/
│   │   │   └── tickets-service.ts
│   │   ├── components/
│   │   │   ├── TicketCard.tsx
│   │   │   └── QRCodeDisplay.tsx           # QRCodeSVG, level="M", size 256–320px
│   │   └── types.ts
│   └── check-in/
│       ├── hooks/
│       │   └── useValidateTicket.ts        # POST /gate/validate — sempre 200, nunca lança
│       ├── services/
│       │   └── check-in-service.ts
│       └── components/
│           ├── QRScanner.tsx                # trava de 2s entre leituras — ver 05 e 07
│           ├── ManualCodeInput.tsx
│           └── ValidationResult.tsx          # 4 estados visuais: VALID/ALREADY_USED/WRONG_EVENT/INVALID
│
├── components/
│   └── ui/                                  # shadcn/ui — gerados via CLI, não editar à mão
│
├── lib/
│   ├── http-client.ts                       # instância axios + interceptor de refresh (single-flight)
│   ├── query-client.ts                      # QueryClient + staleTime por rota (ver 07-performance.md)
│   ├── messages.ts                          # strings de erro/feedback em português, por domínio
│   ├── api-errors.ts                        # classe ApiError, parse do formato { error: {...} }
│   └── utils.ts
│
├── stores/
│   └── ui-store.ts                          # zustand global: sidebar, tema
│
├── middleware.ts                             # protege rotas por role (CUSTOMER/ORGANIZER/GATE)
└── types/
    └── index.ts                              # enums compartilhados (Role, EventStatus, etc.)
```

## Autenticação — pontos críticos

Detalhes completos em `02-autenticacao.md` e `07-performance.md`. Resumo do que **não pode** ser esquecido na implementação:

- `accessToken` em memória (Zustand), `refreshToken` em `localStorage`. Documentar essa troca conscientemente no README (XSS vs. sobreviver ao F5) — a API não suporta cookie `httpOnly`.
- **Refresh é single-flight, obrigatório.** Duas chamadas simultâneas a `/auth/refresh` derrubam todas as sessões do usuário (reuso de refresh token é tratado como roubo). Implementar exatamente o padrão do doc: uma promise em andamento, as demais aguardam a mesma.
- Agendar renovação proativa em ~80% de `expiresIn` (900s → renovar aos 720s), para o 401 idealmente nunca acontecer.
- `401` → tenta renovar uma vez, senão manda pro login. `403` → **nunca tenta renovar**, mostra mensagem de permissão. Confundir os dois gera loop de logout.
- Cadastro sempre nasce `CUSTOMER`; não construir tela de escolha de papel. `ORGANIZER` e `GATE` só existem via seed.
- Mensagem de `401` em login é idêntica para "email não existe" e "senha errada" — não tentar diferenciar na UI.

## Erros — tratamento único

Todo erro da API vem no formato `{ error: { code, message, details?, requestId } }` (ver `06-erros-e-convencoes.md`). Regras:

- Ramificar lógica pelo **`code`**, nunca pela `message` (mensagens mudam, códigos não).
- `VALIDATION_ERROR` → mapear `details[].path` para `form.setError` (React Hook Form ou equivalente).
- Tela de erro genérica deve mostrar a `message` (já em português) e o `requestId` em texto pequeno — é o que liga o erro ao log do backend.
- `409` é o código mais "rico" — o significado depende do endpoint (assento ocupado, evento cancelado, idempotency key reusada, reserva já paga). Tratar caso a caso, não genericamente.
- `lib/messages.ts` centraliza mensagens de fallback/genéricas por domínio (auth, reservations, payment, checkin) para os casos em que a API não cobre ou para mensagens de rede/timeout do próprio axios.

## Idempotência

- `Idempotency-Key` obrigatório na prática em `POST /events/:id/reservations` e `POST /reservations/:id/payment`.
- Uma chave por **intenção do usuário**, gerada no momento da decisão (clique em "reservar este assento"), reaproveitada apenas em retry da mesma tentativa. Trocar de assento = nova chave.
- Ler `Idempotency-Replayed: true` na resposta é opcional, mas útil para não mostrar duplo toast de sucesso.

## Paginação

- `skip`/`take` (padrão 20, máx 50) em `/events`, `/events/mine`, `/reservations/mine`, `/tickets/mine`.
- Exceção: `/catalog/search` pagina com `page`, começando em 1 (segue as APIs externas).

## Design — evitar AI slop

Referência visual combinada: **estética AdminLTE** (densidade de informação, sidebar fixa, cards com header/body bem demarcados, tabelas com bordas sutis, paleta sóbria de admin dashboard clássico), mas **implementada com Tailwind + shadcn/ui**, não com Bootstrap ou clonando o CSS do AdminLTE literalmente. A ideia é o *espírito* — um painel que parece feito para uso operacional real (organizador gerenciando eventos, portaria validando ingressos), não um dashboard genérico de SaaS gerado por IA.

Decisões concretas para fugir da "cara de IA":

- **Nada de gradiente roxo-azul genérico, nada de emoji como ícone, nada de card com sombra flutuante exagerada.** Paleta sóbria, poucas cores de destaque (uma para ação primária, uma para sucesso/erro nos 4 estados da portaria).
- **Densidade de dashboard, não espaçamento de landing page.** O painel do organizador (TanStack Table) deve parecer uma ferramenta de trabalho: linhas compactas, ações inline, filtros no topo — não cards grandes e espaçados.
- **Tipografia com hierarquia real**, não tudo do mesmo peso/tamanho com só a cor mudando.
- Os 4 estados de validação na portaria (`VALID`/`ALREADY_USED`/`WRONG_EVENT`/`INVALID`) merecem tela cheia de cor + ícone grande + som/vibração opcional — é o momento de maior tensão do fluxo (fila de gente esperando), e é onde dá pra mostrar decisão de design deliberada em vez de um toast genérico.
- Registrar no README (ou `DECISIONS.md`) *por que* cada escolha não-óbvia foi feita — o enunciado do desafio pede exatamente isso.

## Performance — checklist rápido (detalhe em `07-performance.md`)

1. Refresh de sessão single-flight (crítico — ver seção Autenticação).
2. Idempotency-Key por intenção, não por request.
3. Travar botão de reservar e leitor de QR durante a chamada (debounce de ~2s no scanner).
4. Nunca refazer chamada por dado que já veio embutido (`tickets/mine` já traz `event`; `reservations/mine` já traz `seatLabel`).
5. Debounce de 300–500ms na busca do catálogo e na busca de eventos.
6. Carregar detalhe do evento + mapa de assentos em paralelo (`Promise.all`).
7. Recarregar o mapa de assentos sempre após um `409` de reserva.
8. `staleTime` por rota conforme tabela do `07-performance.md` — atenção especial a `GET /events/:id/seats` com `staleTime: 0`.

## Dados de teste (seed do backend)

| Papel | E-mail | Senha |
| --- | --- | --- |
| `ORGANIZER` | `organizador@verzel.test` | `organizador123` |
| `CUSTOMER` | `cliente1@verzel.test` | `cliente123` |
| `CUSTOMER` | `cliente2@verzel.test` | `cliente123` |
| `GATE` | `portaria@verzel.test` | `portaria123` |

Seed já inclui um evento publicado com 30 assentos e um ingresso válido — não é preciso criar nada manualmente para navegar todos os fluxos.

## Ambiente

```bash
VITE_API_URL=http://localhost:3000   # adaptar nome da env var para o padrão Next.js: NEXT_PUBLIC_API_URL
```

Backend sobe com:
```bash
docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev
```

## O que ainda precisa de decisão

- Qual fluxo de reserva implementar: mapa de assentos, quantidade (pista), ou os dois. O backend documentado aqui é o de mapa de assentos (`seatId`) — se optar por incluir pista, verificar se a API tem suporte equivalente antes de prometer no README.
- Estratégia de leitura de câmera para QR (biblioteca específica) — a doc só cobre o desenho do QR (`qrcode.react`), não a leitura.
- Se e como aplicar tradução amigável nos `details[].path`/`.message` de `VALIDATION_ERROR`, que vêm em inglês do Zod.
