# Spec 000 — Fundação e arquitetura

**Status:** aprovado · **Data:** 2026-08-13 · **Epic:** `00-fundacao`

Spec de fundação do frontend. Define a arquitetura de sessão, a camada de
componentes reutilizáveis, o tema, o fluxo de trabalho em git e a estratégia de
testes. Os specs `001`–`008` tratam de features e assumem tudo daqui como dado.

A documentação da API está em [`docs/doc-frontend/`](../doc-frontend/) e é a
fonte da verdade sobre contratos. Este spec não os repete; referencia.

---

## 1. Objetivo e critério de sucesso

O desafio Elite Dev avalia **decisões, não funcionamento** — o enunciado é
explícito sobre o avaliador já conhecer o resultado de colar o PDF numa
ferramenta de IA. Logo, o critério de sucesso deste spec não é "o app roda", é:

1. Cada escolha não-óbvia tem justificativa escrita e rastreável
   (`DECISIONS.md` + este spec).
2. O histórico do git conta a construção: commits atômicos, semânticos, ao
   longo de vários dias, integrados por pull request.
3. A UI parece ferramenta operacional, não template genérico de SaaS.

---

## 2. Sessão: BFF com cookies httpOnly

### 2.1 O problema com a recomendação da documentação

O [`02-autenticacao.md`](../doc-frontend/02-autenticacao.md) recomenda
`accessToken` em memória e `refreshToken` em `localStorage`, reconhecendo que é
uma troca consciente e que `localStorage` é acessível por XSS. A justificativa é
que a API não suporta cookie `httpOnly` — os tokens vêm no corpo da resposta.

Isso é verdade sobre a API, mas **não** é uma restrição sobre o frontend. Next
App Router tem servidor. Um único XSS numa dependência de terceiros exfiltra um
refresh token de 7 dias do `localStorage`; num cookie `httpOnly`, o mesmo XSS
não consegue lê-lo.

### 2.2 Arquitetura escolhida

O Next atua como **Backend-for-Frontend**. O browser nunca vê token: fala apenas
com `/api/*` da própria origem, mandando cookies. O servidor Next lê o cookie,
injeta `Authorization: Bearer` e encaminha para a API.

```
browser ──cookie httpOnly──> Next Route Handler ──Bearer──> API :3000
```

### 2.3 Cookies

| Cookie | Conteúdo | `httpOnly` | `path` | Vida |
|---|---|---|---|---|
| `vz_at` | `accessToken` | sim | `/` | 900 s (`expiresIn` da API) |
| `vz_rt` | `refreshToken` | sim | `/api/auth` | 7 dias |
| `vz_renew_at` | epoch ms em que renovar | sim | `/` | 7 dias |
| `vz_user` | JSON `{ id, name, role }` | **não** | `/` | 7 dias |

Todos com `sameSite=lax` e `secure` quando `NODE_ENV === "production"`.

`vz_rt` tem `path=/api/auth` de propósito: o proxy genérico de dados nunca
recebe o refresh token do browser, só as rotas que precisam dele.

`vz_user` é o único legível pelo JavaScript, e **não é credencial**. Existe para
o `middleware.ts` rotear por papel e para a UI decidir o que renderizar sem uma
ida a `/auth/me` a cada navegação. Adulterá-lo permite ao usuário abrir a casca
de uma tela que não lhe pertence; as chamadas de dados dentro dela respondem
`403`. **Gate de UI é UX; o gate real é a API.** Isso vai escrito no
`DECISIONS.md` — é justamente o tipo de decisão que precisa estar explícita, não
implícita.

### 2.4 Renovação: proativa, com single-flight no servidor

Duas chamadas simultâneas a `/auth/refresh` derrubam **todas** as sessões do
usuário: o refresh token vale uma vez e reapresentá-lo é tratado como roubo
(`02-autenticacao.md`, `07-performance.md` item 1). Duas defesas, em camadas:

**Proativa (caminho normal).** O instante de renovação é calculado **uma vez**,
no login/refresh, a partir do `expiresIn` que a própria API devolve, e gravado
em `vz_renew_at`. Assim o proxy não precisa supor a vida do token — só comparar
dois números:

```ts
// ao gravar a sessão
const LIMITE = 0.8; // renova a 80% da vida (900 s -> 720 s)
const renewAt = Date.now() + sessao.expiresIn * LIMITE * 1000;

// no proxy, antes de encaminhar
if (Date.now() >= renewAt) await renovarSessao(refreshToken);
```

Com isso o `401` por expiração deixa de ser rotina.

**Single-flight (a trava).** Uma promessa em escopo de módulo, chaveada pelo
refresh token. Chamadas concorrentes aguardam a mesma promessa.

```ts
// src/server/refresh.ts
const emCurso = new Map<string, Promise<Session>>();

export function renovarSessao(refreshToken: string): Promise<Session> {
  const existente = emCurso.get(refreshToken);
  if (existente) return existente;

  const promessa = apiServer<Session>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  }).finally(() => emCurso.delete(refreshToken));

  emCurso.set(refreshToken, promessa);
  return promessa;
}
```

**Limitação documentada:** o single-flight vale por processo. Em deploy
distribuído (várias instâncias serverless), duas instâncias poderiam renovar em
paralelo e derrubar a sessão; a solução real seria um lock externo (Redis) ou
sessão server-side com id opaco. Fora do escopo do desafio, mas registrado no
`DECISIONS.md` como limite conhecido — apontar o próprio limite vale mais que
finger que ele não existe.

**Fallback.** Se, apesar do refresh proativo, a API responder `401`, o proxy
renova uma vez e repete a requisição original. Segundo `401` seguido: limpa os
cookies e responde `401` ao browser, que redireciona para `/login`.

`403` **nunca** dispara renovação (`06-erros-e-convencoes.md`). Confundir os
dois gera laço de renovação que termina deslogando o usuário por reuso de token.

### 2.5 Route handlers

| Rota | Faz |
|---|---|
| `POST /api/auth/login` | Chama a API, grava os 4 cookies, devolve `{ user }` |
| `POST /api/auth/register` | Idem (usuário nasce `CUSTOMER`) |
| `POST /api/auth/logout` | Chama a API com o `refreshToken`, apaga os cookies |
| `GET /api/auth/session` | Reidrata o usuário no boot (ver abaixo), ou `401` |
| `ALL /api/v/[...path]` | Proxy genérico para o resto da API |

O proxy encaminha método, query e corpo; repassa `Idempotency-Key` na ida e
expõe `Idempotency-Replayed` na volta. Cabeçalhos de entrada seguem
**allowlist** (`content-type`, `idempotency-key`) — repassar tudo às cegas é
como um proxy vaza cabeçalho que não devia.

O prefixo `/api/v/` separa o proxy de dados das rotas de sessão e evita colisão
com futuras rotas próprias do Next.

**Reidratação no boot.** `GET /api/auth/session` devolve o usuário a partir do
cookie `vz_user` quando ele existe — evita uma ida à API a cada carga de página.
Se `vz_user` faltar mas houver sessão válida (`vz_at` ou `vz_rt`), aí sim chama
`GET /auth/me` na API e regrava o cookie. É o uso correto de `/auth/me` segundo
o `07-performance.md` item 4: reidratar no boot, nunca complementar o login (que
já devolve o `user` completo).

Nenhum token entra no bundle do cliente, e a URL da API vira `API_URL`
server-only — sem `NEXT_PUBLIC_`. O cliente não sabe onde a API mora.

### 2.6 Cliente HTTP no browser

`src/lib/http-client.ts` fica bem menor do que o previsto no CLAUDE.md
original: axios com `baseURL: "/api/v"`, `withCredentials` implícito por ser
mesma origem, e **nenhuma** lógica de token — sem interceptor de refresh, porque
renovar é responsabilidade do servidor. O único interceptor de resposta
converte `{ error: {...} }` em `ApiError` e, em `401`, manda para `/login`.

### 2.7 Proteção de rotas

`middleware.ts` lê `vz_user` e aplica:

| Prefixo | Papel exigido |
|---|---|
| `/events`, `/my-tickets` | autenticado (`CUSTOMER`) |
| `/dashboard` | `ORGANIZER` |
| `/check-in` | `GATE` |
| `/ticket/[code]`, `/login`, `/register` | público |

Sem cookie em rota protegida: redireciona para `/login?next=<rota>`. Papel
errado: `/403`, com mensagem de permissão — não para o login, porque a sessão é
válida.

---

## 3. Estrutura de pastas

Altera a estrutura do CLAUDE.md em dois pontos: nasce `src/server/` (código que
nunca vai para o browser) e `src/components/` cresce com o kit reutilizável.

```
src/
├── app/
│   ├── (auth)/login|register/
│   ├── (client)/events/[id]/checkout, my-tickets, ticket/[code]
│   ├── (organizer)/dashboard/{page,new,[id]}
│   ├── (gate)/check-in/
│   ├── api/
│   │   ├── auth/{login,register,logout,session}/route.ts
│   │   └── v/[...path]/route.ts          # proxy genérico
│   └── layout.tsx
│
├── server/                                # server-only, nunca importado no client
│   ├── api-client.ts                      # fetch para a API + parse de erro
│   ├── session.ts                         # ler/gravar/limpar os cookies
│   ├── refresh.ts                         # single-flight
│   └── proxy.ts                           # lógica compartilhada do route handler
│
├── features/                              # como no CLAUDE.md: hooks, services,
│                                          # components e types por domínio
│   auth · catalog · events · reservations · payment · tickets · check-in
│
├── components/
│   ├── ui/                                # shadcn/ui (gerado por CLI)
│   ├── form/                              # Form, FormInput, FormSelect, ...
│   ├── data-table/                        # DataTable genérica
│   ├── modal/                             # Modal + useConfirm
│   └── layout/                            # AppShell, Sidebar, Topbar, ThemeToggle
│
├── lib/
│   ├── http-client.ts · query-client.ts · api-errors.ts
│   ├── messages.ts                        # strings pt-BR por domínio
│   ├── field-labels.ts                    # path do Zod -> label pt-BR
│   └── utils.ts
│
├── stores/ui-store.ts
├── middleware.ts
└── types/index.ts
```

Regra de tamanho: arquivo passando de ~200 linhas é sinal de responsabilidade
demais. Vale sobretudo para `SeatMap`, `DataTable` e o route handler do proxy.

---

## 4. Camada de componentes

### 4.1 Modal — semântica Bootstrap, motor Radix

Bootstrap acertou a **API** (header/body/footer, tamanhos, backdrop estático);
errou a acessibilidade que hoje se espera. Então: composição no estilo
Bootstrap por cima do Dialog do shadcn/Radix, que já resolve foco preso,
`Escape`, `aria-modal` e retorno de foco.

```tsx
<Modal open={open} onOpenChange={setOpen} size="lg" staticBackdrop>
  <Modal.Header>Cancelar evento</Modal.Header>
  <Modal.Body>…</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={fechar}>Voltar</Button>
    <Button variant="destructive" onClick={confirmar}>Cancelar evento</Button>
  </Modal.Footer>
</Modal>
```

- `size`: `sm | md | lg | xl` (larguras fixas, não percentual)
- `staticBackdrop`: clique fora não fecha — para modal com formulário sujo
- `Modal.Body` rola sozinho; header e footer ficam fixos

Mais `useConfirm()` imperativo, porque "tem certeza?" aparece em cancelar
evento, cancelar reserva, publicar evento e logout — quatro modais copiados se
não houver abstração:

```ts
const confirmar = useConfirm();
if (await confirmar({ title: "Cancelar evento", tone: "destructive" })) { … }
```

### 4.2 Formulários

React Hook Form + Zod. Um `<Form>` que injeta o `zodResolver` e provê contexto,
e campos que já sabem exibir label, erro e estado de envio:

```tsx
<Form schema={loginSchema} onSubmit={entrar}>
  <FormInput name="email" label="E-mail" autoComplete="email" />
  <FormPassword name="password" label="Senha" />
  <Button type="submit" loading={isPending}>Entrar</Button>
</Form>
```

Campos: `FormInput`, `FormPassword`, `FormTextarea`, `FormSelect`,
`FormDateTime`, `FormMoney` (BRL, número no submit — a API espera `45.5`, não
string), `FormNumber`.

**`useApiFormErrors`** — a peça que resolve o item em aberto do CLAUDE.md sobre
tradução de `VALIDATION_ERROR`. Os `details[].message` vêm do Zod em inglês
("Too small: expected string to have >=8 characters"), impróprios para o
usuário final. O hook:

1. Casa `details[].path` (notação de ponto) com o campo do formulário.
2. Traduz por **campo + tipo de violação**, via `lib/field-labels.ts`, não por
   tradução literal da frase do Zod.
3. `path: "(corpo)"` (corpo ausente) e caminhos sem campo correspondente vão
   para o erro geral do formulário, nunca somem em silêncio.

### 4.3 DataTable

Wrapper genérico sobre TanStack Table, densidade AdminLTE, paginação
server-side em `skip`/`take` (`take` máximo 50 — pedir mais responde `400`).

```tsx
<DataTable
  columns={eventColumns}
  data={data?.items}
  totalCount={data?.total}
  pagination={{ skip, take, onChange }}
  sorting={{ state: sorting, onChange: setSorting }}
  isLoading={isLoading}
  error={error}
  emptyState={<SemEventos />}
  toolbar={{ search: true, columnVisibility: true }}
  rowActions={(evento) => [
    { label: "Editar", href: `/dashboard/${evento.id}` },
    { label: "Publicar", onClick: () => publicar(evento.id), hidden: evento.status !== "DRAFT" },
  ]}
/>
```

Inclui: colunas declarativas tipadas, ordenação, paginação, busca com debounce
de 400 ms, filtro por coluna, visibilidade de colunas, ações inline por linha e
os quatro estados visuais (carregando com skeleton nas linhas, vazio, erro com
`requestId`, populado).

**Fora de escopo por não ter consumidor** (YAGNI, e registrado como decisão
deliberada): seleção múltipla com ação em lote, agrupamento por coluna,
master-detail, redimensionar/reordenar colunas, export CSV, estado de grade
persistido.

### 4.4 Leitura de QR (dependência decidida aqui, usada no epic `06`)

A documentação cobre o **desenho** do QR (`qrcode.react`), não a leitura. Decisão:
`BarcodeDetector` nativo quando o navegador oferece (Chrome, Edge, Android —
decodificação nativa, zero byte de bundle) e `zxing-wasm` carregado **sob
demanda** apenas quando não houver suporte (Safari, Firefox). Os dois ficam atrás
de uma interface única no `QRScanner`, que também detém a trava de 2 s entre
leituras e o ciclo de vida da câmera (`getUserMedia` com
`facingMode: "environment"`, loop via `requestVideoFrameCallback`).

O `ManualCodeInput` fica **sempre visível**, não escondido atrás de um "ter
problemas?": na portaria, com fila esperando, câmera negada ou QR riscado não
pode ser um beco sem saída.

### 4.5 Estados de página

`<AsyncBoundary>` padroniza carregando/erro/vazio nas telas, para não haver
três desenhos diferentes de "deu erro". Toda tela de erro mostra a `message` da
API (já vem em português, escrita para o usuário final) e o `requestId` em letra
miúda — é o que liga a reclamação ao log do backend.

---

## 5. Tema e dark mode

Tema em **cookie**, não `localStorage`. O servidor lê o cookie e já renderiza a
classe correta em `<html>`: sem flash de tema errado, sem mismatch de
hidratação, sem script bloqueante no `<head>`. Coerente com a decisão de sessão.

Três estados: `light`, `dark`, `system` (`system` resolvido por
`prefers-color-scheme`, com `@media` cobrindo o caso de cookie ausente).

Paleta: tokens CSS do shadcn com valores sóbrios de painel administrativo.
Restrições que evitam a "cara de IA" (ver CLAUDE.md): sem gradiente
roxo-azul, sem emoji como ícone, sem sombra flutuante exagerada, uma cor de ação
primária.

Os quatro estados da portaria (`VALID`/`ALREADY_USED`/`WRONG_EVENT`/`INVALID`)
recebem pares de cor calibrados nos dois temas, com contraste AA — e **cada um
tem ícone próprio**, porque cor sozinha falha para daltônicos e a portaria é
exatamente onde a leitura precisa ser instantânea.

---

## 6. Estado: quem guarda o quê

| Tipo de estado | Onde | Exemplo |
|---|---|---|
| Dado do servidor | TanStack Query | eventos, assentos, ingressos |
| Sessão | cookie + `vz_user` no boot | usuário, papel |
| Efêmero de fluxo | Zustand | assento selecionado, `Idempotency-Key`, countdown |
| Preferência de UI | Zustand + cookie | tema, sidebar recolhida |

Regra: se veio da API, é do Query — não se copia para Zustand. Duplicar dado de
servidor em store global é a origem clássica de tela desatualizada.

`staleTime` por rota conforme a tabela do
[`07-performance.md`](../doc-frontend/07-performance.md), configurado em
`lib/query-client.ts`. O caso que não pode escapar: `GET /events/:id/seats` com
`staleTime: 0` — mapa de assentos cacheado é a receita para o usuário clicar num
lugar já vendido.

---

## 7. Erros e idempotência

**Ramificar sempre pelo `code`, nunca pela `message`** — mensagens mudam,
códigos não. `ApiError` carrega `status`, `code`, `message`, `details`,
`requestId`.

O `409 CONFLICT` é o mais rico da API e o significado depende do endpoint
(assento ocupado, evento cancelado, chave de idempotência reusada, reserva já
paga). Tratamento caso a caso, no hook de cada domínio — nunca um handler
genérico de 409. Na reserva, `409` **sempre** dispara refetch do mapa de
assentos: o usuário precisa ver o lugar ficar vermelho.

**Idempotência.** Uma `Idempotency-Key` por *intenção*, gerada quando o usuário
decide (clique em "reservar este assento"), guardada no store de reserva e
reutilizada apenas em retry da mesma tentativa. Trocar de assento descarta a
chave e gera outra — reaproveitar chave com corpo diferente responde `409` de
propósito. `Idempotency-Replayed: true` na resposta suprime o segundo toast de
sucesso: a operação não aconteceu de novo, o usuário só clicou duas vezes.

---

## 8. Testes

Vitest + Testing Library + MSW. Cirúrgico: onde a lógica é real e o bug custa
caro. O README explica **por que estes** — a escolha do que testar diz mais
sobre critério do que um número de cobertura.

| Alvo | O que o teste prova |
|---|---|
| `server/refresh.ts` | Duas chamadas concorrentes geram **um** POST a `/auth/refresh` |
| Proxy | `vz_renew_at` vencido renova antes de encaminhar; `403` **não** renova |
| `api-errors.ts` | `{ error: {...} }` vira `ApiError` com `code` e `requestId` |
| `useApiFormErrors` | `details[].path` chega ao campo; `(corpo)` vai ao erro geral |
| Store de reserva | Mesma intenção reusa a chave; trocar de assento gera outra |
| `ValidationResult` | Os 4 estados renderizam cor e ícone distintos |
| `QRScanner` | Segunda leitura dentro de 2 s é ignorada |
| `ReservationCountdown` | Conta a partir de `expiresAt` e desaparece ao expirar |
| `DataTable` | Ordenação, mudança de página e estado vazio |

Não se testa markup trivial ("EventCard renderiza o título") — é ruído que
quebra a cada ajuste de layout sem indicar defeito algum.

E2E com Playwright fica **fora do escopo** desta fundação: exigiria backend de
pé no CI. Registrado no README como próximo passo, com o caminho que cobriria
(login → assento → pagamento → QR → portaria).

---

## 9. Fluxo de trabalho em git

- **Conventional commits**, atômicos, em português no corpo.
  `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `ci`.
- **Uma branch por epic:** `feat/01-auth-bff`, `docs/000-fundacao-arquitetura`.
- **Nada direto em `main`.** Única exceção já consumada: o commit raiz de
  bootstrap, porque pull request precisa de uma base para existir.
- **PR sempre**, com descrição ligando ao spec e ao trecho do BACKLOG.
- **Merge por rebase**, não squash: squash colapsaria os commits atômicos, e o
  histórico é parte avaliada da entrega.
- **CI no PR** (GitHub Actions): `lint`, `typecheck`, `test`, `build`.

---

## 10. Ambiente

```bash
API_URL=http://localhost:3000          # server-only, não vai para o bundle
SESSION_COOKIE_SECURE=false            # true em produção
PORT=3001                              # a :3000 é do backend
```

Next em dev na `:3001`. Como o BFF fala com a API de servidor para servidor,
**CORS deixa de ser problema** — mas a porta ainda precisa mudar, senão colide
com o backend.

---

## 11. Epics

| # | Epic | Entrega |
|---|---|---|
| `00` | Fundação | Scaffold, lint/format, CI, Vitest, tema, AppShell |
| `01` | Auth BFF | Cookies, session, proxy, single-flight, login/register, middleware |
| `02` | UI kit | Modal + useConfirm, Form + campos, DataTable, AsyncBoundary |
| `03` | Catálogo e eventos | Lista com filtros, detalhe, mapa de assentos |
| `04` | Reserva e pagamento | Seleção, idempotência, countdown, 409, simulador |
| `05` | Ingressos | `my-tickets`, QR, página pública `/ticket/[code]` |
| `06` | Portaria | Scanner, input manual, 4 estados em tela cheia |
| `07` | Dashboard organizador | DataTable, busca no catálogo, criar/editar, publish/cancel |
| `08` | Entrega | README, DECISIONS, documentação do uso de IA |

Ordem com propósito: `02` antes das telas, para que catálogo, dashboard e
checkout consumam os mesmos componentes em vez de cada tela inventar o seu — é o
que "componentizar ao máximo" significa na prática.

Cada epic: spec em `docs/specs/`, tasks marcáveis em `docs/BACKLOG.md`, uma
branch, um PR.

---

## 12. Escopo do fluxo de reserva

**Mapa de assentos, um assento por reserva.** `POST /events/:id/reservations`
aceita apenas `{ seatId }` — não existe reserva por quantidade ("pista") nesta
API. Prometer pista no README sem suporte no backend seria furo de entrega.

---

## 13. Fora de escopo

Deliberadamente ausentes, para não inflar a entrega:

- E2E no CI (justificado na seção 8)
- Recursos avançados da DataTable (seção 4.3)
- Internacionalização — textos visíveis em pt-BR, código em inglês
- Tela de escolha de papel: cadastro sempre nasce `CUSTOMER`; `ORGANIZER` e
  `GATE` só existem via seed do backend
- PWA, notificações push, WebSocket (a API não tem canal de tempo real; o mapa
  de assentos atualiza sob demanda e ao focar a janela)

---

## 14. Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Single-flight não cobre deploy distribuído | Documentado; lock externo seria a solução real |
| `vz_user` adulterável no browser | Gate real é o `403` da API; UI gating é só UX |
| `BarcodeDetector` ausente em Safari/Firefox | Fallback `zxing-wasm` sob demanda + input manual sempre visível |
| Proxy BFF adiciona um salto de latência | Aceito: rede local, e o ganho de segurança compensa |
| Câmera exige HTTPS fora de `localhost` | Input manual cobre; documentado no README |
