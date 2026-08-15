# Spec 009 — Experiência pública, navegação por papel e modernização visual

## 1. Contexto

A aplicação entrega os fluxos funcionais, mas a arquitetura visual atual impede que eles sejam percebidos:

1. a raiz leva direto ao login, portanto não existe uma vitrine pública;
2. `/events` e `/events/[id]` exigem sessão `CUSTOMER`, embora a consulta de eventos seja pública na API;
3. a sidebar mostra módulos de todos os papéis como itens bloqueados, criando controles sem ação e sugerindo permissões que o usuário não possui;
4. `EventCard` coloca pôsteres normalmente verticais em um quadro `16:9` com `object-cover`, cortando título, rostos e arte principal;
5. a jornada “descobrir → escolher → reservar → pagar” fica fragmentada e o CTA de compra não é evidente;
6. uma única casca operacional é aplicada a contextos muito diferentes: compra, gestão e portaria.

Este ciclo trata o problema como arquitetura de experiência, não como troca superficial de cores.

## 2. Objetivos

- Permitir que qualquer visitante descubra e consulte eventos sem autenticação.
- Tornar a compra uma jornada explícita e contínua.
- Mostrar somente navegação relevante ao papel autenticado.
- Preservar pôsteres sem recorte destrutivo.
- Modernizar hierarquia, ritmo, responsividade e estados de interação mantendo a identidade sóbria do projeto.
- Dar à vitrine linguagem de plataforma de streaming e ao painel densidade operacional, sobre um único sistema de design (seção 7.0).
- Manter autorização real na API; ocultar navegação é UX, não segurança.

## 3. Fora de escopo

- Alterar contratos ou regras de negócio do backend.
- Permitir reserva ou pagamento anônimo: essas operações continuam exigindo `CUSTOMER`.
- Criar marketplace, carrinho com múltiplos eventos ou reserva de vários assentos.
- Adicionar gradientes genéricos, bibliotecas completas de dashboard ou dependência nova de carrossel.
- Rotação automática de banner: nenhum conteúdo troca sozinho sob o olho do usuário.

> **Emenda (ciclo de modernização visual).** A restrição original deste
> documento proibia "animações decorativas pesadas", o que na prática vetava
> qualquer carrossel. A proibição passa a ser específica — rotação automática
> e dependência nova — e o movimento **iniciado pelo usuário** é permitido sob
> as condições da seção 7.3. O motivo está em `DECISIONS.md`.

## 4. Arquitetura de navegação

### 4.1 Shell público

Usado por `/`, `/events` e `/events/[id]`.

- Header horizontal com marca, link “Eventos”, alternância de tema e ações “Entrar”/“Criar conta”.
- Quando houver sessão, substitui as ações pelo nome do usuário e link para sua área.
- Conteúdo com largura máxima, respiro de vitrine e footer mínimo.
- Sem sidebar.

### 4.2 Área do cliente

Rotas: `/events/[id]/checkout` e `/my-tickets`.

- Navegação: “Explorar eventos” e “Meus ingressos”.
- Nenhum link de organizador ou portaria.
- Checkout usa cabeçalho discreto e indicador de etapas: assento → reserva → pagamento → ingresso.

### 4.3 Área do organizador

Rotas: `/dashboard`, `/dashboard/new` e `/dashboard/[id]`.

- Sidebar operacional real, com links ativos para “Meus eventos” e “Novo evento”.
- Acesso secundário à vitrine pública em nova navegação normal, não como módulo bloqueado.
- Sem itens de cliente ou portaria.

### 4.4 Portaria

Rota: `/check-in`.

- Shell focado, sem sidebar persistente.
- Apenas troca de evento, preferências de feedback, sessão e saída.
- A interface preserva o máximo de área para scanner e resultado.

### 4.5 Regras por sessão

| Estado/papel | Destino da área | Navegação visível |
|---|---|---|
| Visitante | `/events` | Eventos, entrar, criar conta |
| `CUSTOMER` | `/my-tickets` | Eventos, meus ingressos |
| `ORGANIZER` | `/dashboard` | Meus eventos, novo evento, ver vitrine |
| `GATE` | `/check-in` | Portaria |

Itens sem permissão não são renderizados. O proxy continua protegendo checkout, ingressos, dashboard e portaria.

## 5. Vitrine pública

### 5.1 Página inicial `/`

- Hero do evento em destaque (`CinemaHero`), conforme a seção 7.2. Substitui a
  formulação anterior de "hero compacto com busca": a busca vive junto do
  resultado, no bloco de programação, e não duplicada no topo.
- Fileira “estreia em breve” (`EventRow`) e, abaixo dela, a programação completa
  paginada — ambas consumindo `GET /events`.
- Hero e fileira compartilham a **mesma chave de Query** do primeiro lote da
  programação: uma requisição serve os três blocos.
- Estados de carregamento, vazio e erro reaproveitam o kit existente; o
  esqueleto do hero e da fileira preserva a altura final, sem layout shift.
- A raiz deixa de redirecionar automaticamente ao login.

### 5.2 Lista `/events`

- Pública, pesquisável e paginada.
- Grid responsivo: 2 colunas em telas médias, 3–5 conforme largura disponível.
- Filtros permanecem compactos e próximos do resultado.
- Cards têm CTA semântico “Ver detalhes”; o card inteiro pode continuar clicável desde que o foco seja inequívoco.

### 5.3 Pôsteres

- Card usa quadro vertical `2:3`, adequado a filmes e aceitável para artes de shows.
- Imagem usa `object-contain`; nunca corta a arte principal.
- O fundo derivado em blur, antes opcional, passa a ser o padrão do card (seção
  7.2). Ele reusa a mesma URL já baixada — nenhuma requisição extra — e o
  fallback sem imagem continua em fundo neutro.
- Detalhe usa pôster vertical ao lado dos dados em desktop e acima do conteúdo em mobile.
- Fallback sem imagem mantém exatamente a mesma proporção para evitar layout shift.

## 6. Jornada de compra

```text
Vitrine pública
  → detalhe público do evento
  → selecionar “Escolher ingresso”
  → visitante: login/cadastro com next=/events/:id/checkout
  → cliente: checkout
  → escolher um assento
  → confirmar reserva e acompanhar expiração
  → simular pagamento
  → ingresso emitido com acesso a “Meus ingressos”
```

No detalhe, o mapa pode comunicar disponibilidade, mas a mutação de reserva acontece somente no checkout. O CTA deve explicar preço, disponibilidade e necessidade de login sem surpreender o visitante.

## 7. Requisitos visuais

### 7.0 Dois idiomas, um sistema

A vitrine e o painel têm trabalhos diferentes: a primeira precisa fazer o
visitante querer entrar, o segundo precisa deixar o organizador operar rápido.
Aplicar uma única linguagem aos dois piora um deles. Portanto:

- **Área pública** — linguagem de plataforma de streaming: superfície profunda,
  pôster como protagonista, movimento horizontal, respiro maior.
- **Áreas autenticadas** (organizador, cliente, portaria) — densidade
  operacional, na linha do espírito AdminLTE já adotado.

O que **não** se divide: tokens de cor, escala tipográfica, raio, escala de
espaçamento, componentes de formulário e regras de acessibilidade. São o mesmo
sistema em dois registros, não dois temas concorrentes. `CLAUDE.md` deve ser
corrigido no mesmo PR para refletir esta divisão.

### 7.1 Base de tokens

- **Par `--cinema` / `--cinema-foreground`**: superfície profunda que permanece
  escura **nos dois temas**, usada exclusivamente pelo hero e pela faixa do
  carrossel. Dá o clima cinematográfico no tema claro sem inverter a página, e
  funde com o fundo no tema escuro. Substitui o uso de `bg-foreground
  text-background`, que inverte junto com o tema e vira um bloco claro no
  escuro. Segue as três definições obrigatórias de `globals.css` (`:root`,
  `@media`, `[data-theme]`) — nenhum token pode existir só dentro de um bloco.
- **Raio**: `--radius` sobe de `0.375rem` para `0.5rem`; novo `--radius-media`
  (`0.875rem`) para pôsteres e hero. Controles seguem duros, mídia fica macia.
- **Fonte**: `Inter` está declarada em `--font-sans` mas nunca é carregada — o
  app cai no fallback do sistema, de modo que hoje nem o CSS nem a decisão
  "Fontes locais do sistema" do `DECISIONS.md` estão sendo cumpridos. Os
  arquivos `.woff2` da Inter (licença SIL OFL, redistribuição permitida) passam
  a ser versionados no repositório e carregados por `next/font/local`, com
  `display: "swap"` e `variable` amarrada ao token. Sem chamada externa em build
  ou em runtime: a decisão original é preservada na sua intenção
  (reprodutibilidade offline), não apenas na letra.

Nenhuma cor de marca nova: continua uma única cor de ação primária.

### 7.2 Linguagem pública

- Hero do evento em destaque com **scrim em gradiente direcional**, não véu
  chapado: o véu uniforme achata a imagem e deixa o contraste do texto
  dependente do pôster sorteado.
- Pôster preenche o quadro `2:3` usando fundo derivado da própria imagem em
  blur/scale com a arte em `object-contain` por cima — preenchimento visual sem
  violar a regra de não recorte da seção 5.3.
- Sobreposição de `hover` revela preço e ação; o anel de foco nunca é
  substituído por ela.

### 7.3 Carrossel

Trilha horizontal com `scroll-snap` nativo, sem biblioteca. Requisitos:

- setas anterior/próximo são `<button>` reais, com nome acessível, que rolam uma
  página via `scrollBy` e ficam desabilitadas nas extremidades;
- a ordem de tabulação atravessa os cards normalmente: as setas são atalho, não
  o único caminho de navegação;
- `prefers-reduced-motion: reduce` desliga o `scroll-behavior: smooth`;
- em ponteiro grosso as setas somem e vale o arrasto nativo;
- máscara de esmaecimento nas bordas é decorativa e não pode esconder foco;
- nada rotaciona sozinho.

**Uma fileira apenas.** `GET /events` oferece só busca e paginação — não existe
eixo de popularidade, gênero ou recomendação. Fileiras como "Populares" seriam
categoria fabricada. A fileira real é "estreia em breve", por data, e o grid
paginado completo permanece abaixo dela.

### 7.4 Linguagem administrativa

- `PageHeader` compartilhado (eyebrow, título, descrição, ações) substitui o
  cabeçalho remontado à mão em cada tela do organizador.
- Item ativo da sidebar deixa de ser bloco sólido de cor primária — trilho
  lateral com fundo sutil; grupos rotulados; bloco de usuário no rodapé.
- `DataTable` em card com header demarcado, cabeçalho fixo ao rolar, hover de
  linha e badge de status com ponto (cor **e** forma).
- **Sem cards de métrica.** `GET /events/mine` aceita apenas `search`, `skip` e
  `take`; contagem por status exigiria varrer todas as páginas. Painel não
  estampa número que a API não fornece.

### 7.5 Regras comuns aos dois registros

- Paleta sóbria existente, com hierarquia real entre fundo, card e navegação.
- Espaçamento baseado em uma escala consistente de 4/8 px.
- Bordas sutis; sombra apenas para separar elementos que realmente se sobrepõem.
- Estados `hover`, `focus-visible`, ativo, desabilitado e carregando distinguíveis.
- Largura mínima suportada: 360 px.
- Nenhuma ação depende apenas de ícone sem nome acessível.
- Contraste WCAG AA nos dois temas, inclusive sobre `--cinema`.

## 8. Alterações de autorização e rotas

O proxy deixa públicas:

- `/`
- `/events`
- `/events/[id]`

E protege:

- `/events/[id]/checkout` → `CUSTOMER`
- `/my-tickets` → `CUSTOMER`
- `/dashboard/*` → `ORGANIZER`
- `/check-in` → `GATE`

Como a regra atual usa prefixo `/events`, o matcher precisa distinguir checkout das rotas públicas em vez de proteger o prefixo inteiro.

## 9. Componentes previstos

- `PublicShell`, `PublicHeader`, `PublicFooter`
- `CustomerNav`, `OrganizerSidebar`, `GateHeader`
- `RoleHomeLink` e `UserMenu`
- `PublicHome` (o papel antes previsto para `FeaturedEvents` é cumprido por
  `CinemaHero` + `EventRow`; o componente não chega a existir)
- revisão de `EventCard`, `EventDetailContent` e skeletons
- `PurchaseCallout` e `CheckoutSteps`

Do ciclo de modernização visual:

- `CinemaHero` (substitui `StreamingHero`) e `EventRow` (a trilha do carrossel)
- `PageHeader` para as telas do organizador
- revisão de `Sidebar`, `Topbar` e `DataTable`

O `AppShell` atual será dividido ou reduzido; não deve receber condicionais crescentes para todos os papéis.

### 9.1 Correção de kit — `FormPassword`

O botão de mostrar/ocultar centraliza com `-translate-y-1/2`, enquanto
`buttonVariants` já aplica `active:not-aria-[haspopup]:translate-y-px`. No
Tailwind v4 os dois escrevem a mesma variável `--tw-translate-y`, então **no
`:active` a centralização é descartada** e o botão salta meia altura para baixo.
Como ele sai de baixo do cursor entre `mousedown` e `mouseup`, o `click` às
vezes nem dispara — daí o relato de que a senha ora aparece, ora não. O `pr-8`
do campo também é exatamente a largura ocupada pelo botão, sem folga entre texto
e ícone.

Correção: centralizar por `inset-y-0 my-auto`, que não usa `transform` e
portanto não colide, e aumentar a reserva do campo para `pr-10`. O arquivo leva
comentário explicando a colisão, senão a "simplificação" reintroduz o defeito.

O conflito é de CSS e **não é observável em jsdom** — o teste cobre o que é
real (alternância de `type` e de nome acessível, e valor preservado na
alternância) e não finge cobrir a regressão visual.

## 10. Testes essenciais

- proxy permite lista/detalhe públicos e protege checkout;
- navegação não renderiza itens de outro papel;
- visitante que inicia compra volta ao checkout após login;
- card mantém contêiner `2:3` e imagem sem recorte;
- CTA de compra aponta para checkout e preserva `next` quando necessário;
- navegação por teclado percorre header, filtros, cards e CTA em ordem lógica;
- 360 px não produz rolagem horizontal;
- setas do carrossel ficam desabilitadas nas extremidades e a tabulação alcança
  os cards sem depender delas;
- `FormPassword` alterna `type` e nome acessível ao clique, preservando o valor.

## 11. Critérios de aceite

1. Uma janela anônima abre `/` e navega até o detalhe de um evento.
2. Nenhuma sidebar exibe ferramentas bloqueadas ou pertencentes a outro papel.
3. Pôsteres inteiros permanecem visíveis no card e no detalhe.
4. Um visitante que escolhe comprar autentica e retorna ao checkout desejado.
5. Um cliente conclui reserva, pagamento e chega ao ingresso sem usar URL manual.
6. Organizador e portaria veem shells adequados às próprias tarefas.
7. A vitrine lê como plataforma de streaming e o painel segue denso, com a
   mesma paleta, tipografia e componentes de formulário.
8. O carrossel só se move por ação do usuário e é operável sem mouse.
9. Mostrar/ocultar senha responde a todo clique, sem deslocar o botão.
10. Lint, typecheck, testes e build passam.

## 12. Migração

A entrega será incremental para evitar uma grande mudança visual impossível de revisar:

1. tornar catálogo público e corrigir autorização;
2. entregar shell público e pôsteres;
3. ajustar compra e retorno pós-login;
4. separar shells por papel;
5. base de tokens: `--cinema`, raio, carregamento da fonte;
6. corrigir `FormPassword`;
7. vitrine: hero, carrossel e card;
8. painel: `PageHeader`, sidebar e `DataTable`;
9. revisar responsividade, acessibilidade e documentação visual.

Cada passo é um commit próprio. A base de tokens vem antes das telas de
propósito: mudar raio e fonte depois de ajustar layouts obrigaria a refazê-los.
