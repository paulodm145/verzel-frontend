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
- Manter autorização real na API; ocultar navegação é UX, não segurança.

## 3. Fora de escopo

- Alterar contratos ou regras de negócio do backend.
- Permitir reserva ou pagamento anônimo: essas operações continuam exigindo `CUSTOMER`.
- Criar marketplace, carrinho com múltiplos eventos ou reserva de vários assentos.
- Adicionar animações decorativas pesadas, gradientes genéricos ou bibliotecas completas de dashboard.

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

- Hero compacto orientado a tarefa: título, busca e CTA para explorar eventos.
- Bloco “Próximos eventos” consumindo `GET /events`.
- Estados de carregamento, vazio e erro reaproveitam o kit existente.
- A raiz deixa de redirecionar automaticamente ao login.

### 5.2 Lista `/events`

- Pública, pesquisável e paginada.
- Grid responsivo: 2 colunas em telas médias, 3–5 conforme largura disponível.
- Filtros permanecem compactos e próximos do resultado.
- Cards têm CTA semântico “Ver detalhes”; o card inteiro pode continuar clicável desde que o foco seja inequívoco.

### 5.3 Pôsteres

- Card usa quadro vertical `2:3`, adequado a filmes e aceitável para artes de shows.
- Imagem usa `object-contain` sobre fundo neutro; nunca corta a arte principal.
- Pode haver fundo derivado/blur apenas como melhoria progressiva, desde que não prejudique contraste ou performance.
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

- Paleta sóbria existente, com superfícies mais claras e hierarquia maior entre fundo, card e navegação.
- Tipografia de sistema; títulos com escala clara e corpo confortável.
- Espaçamento baseado em uma escala consistente de 4/8 px.
- Bordas mais sutis; sombra apenas para separar elementos que realmente se sobrepõem.
- Estados `hover`, `focus-visible`, ativo, desabilitado e carregando distinguíveis.
- Largura mínima suportada: 360 px.
- Nenhuma ação depende apenas de ícone sem nome acessível.
- Contraste WCAG AA nos dois temas.

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
- `PublicHome`, `FeaturedEvents`
- revisão de `EventCard`, `EventDetailContent` e skeletons
- `PurchaseCallout` e `CheckoutSteps`

O `AppShell` atual será dividido ou reduzido; não deve receber condicionais crescentes para todos os papéis.

## 10. Testes essenciais

- proxy permite lista/detalhe públicos e protege checkout;
- navegação não renderiza itens de outro papel;
- visitante que inicia compra volta ao checkout após login;
- card mantém contêiner `2:3` e imagem sem recorte;
- CTA de compra aponta para checkout e preserva `next` quando necessário;
- navegação por teclado percorre header, filtros, cards e CTA em ordem lógica;
- 360 px não produz rolagem horizontal.

## 11. Critérios de aceite

1. Uma janela anônima abre `/` e navega até o detalhe de um evento.
2. Nenhuma sidebar exibe ferramentas bloqueadas ou pertencentes a outro papel.
3. Pôsteres inteiros permanecem visíveis no card e no detalhe.
4. Um visitante que escolhe comprar autentica e retorna ao checkout desejado.
5. Um cliente conclui reserva, pagamento e chega ao ingresso sem usar URL manual.
6. Organizador e portaria veem shells adequados às próprias tarefas.
7. Lint, typecheck, testes e build passam.

## 12. Migração

A entrega será incremental para evitar uma grande mudança visual impossível de revisar:

1. tornar catálogo público e corrigir autorização;
2. entregar shell público e pôsteres;
3. ajustar compra e retorno pós-login;
4. separar shells por papel;
5. revisar responsividade, acessibilidade e documentação visual.
