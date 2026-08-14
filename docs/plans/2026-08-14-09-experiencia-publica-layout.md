# Epic 09 — Experiência pública e layout moderno · Plano

**Objetivo:** transformar os fluxos já existentes em uma experiência pública de descoberta e compra, com navegação específica por papel e imagens preservadas.

**Spec:** [`../specs/009-experiencia-publica-layout.md`](../specs/009-experiencia-publica-layout.md)  
**Contratos:** [`../doc-frontend/03-eventos-e-catalogo.md`](../doc-frontend/03-eventos-e-catalogo.md) e [`../doc-frontend/04-reserva-e-pagamento.md`](../doc-frontend/04-reserva-e-pagamento.md)  
**Branch de implementação:** `feat/09-experiencia-publica-layout`

## Fase 1 — Acesso público e sessão

- [ ] Escrever testes do proxy para lista/detalhe públicos e checkout protegido.
- [ ] Substituir a regra ampla `/events` por proteção específica do checkout.
- [ ] Manter `/my-tickets`, `/dashboard` e `/check-in` protegidos por papel.
- [ ] Garantir que login preserve apenas destinos internos seguros em `next`.

**Checkpoint:** visitante anônimo acessa catálogo e detalhe; reserva continua protegida.

## Fase 2 — Shell público e vitrine

- [ ] Criar `PublicShell`, header responsivo, footer e menu de usuário.
- [ ] Implementar home pública com busca e próximos eventos.
- [ ] Migrar `/events` e `/events/[id]` do `AppShell` para o shell público.
- [ ] Exibir ações de sessão coerentes: entrar/cadastrar ou acesso à área do papel.

**Checkpoint:** `/` comunica imediatamente o produto e conduz ao catálogo.

## Fase 3 — Imagens e cards

- [ ] Alterar cards para proporção `2:3` e `object-contain`.
- [ ] Reestruturar detalhe com pôster vertical e bloco de informações.
- [ ] Atualizar fallbacks e skeletons sem layout shift.
- [ ] Testar filme, show, imagem ausente e títulos longos.

**Checkpoint:** nenhum pôster é cortado e o grid permanece equilibrado.

## Fase 4 — Jornada de compra

- [ ] Criar `PurchaseCallout` no detalhe com preço, disponibilidade e CTA.
- [ ] Visitante recebe login com retorno ao checkout; cliente segue diretamente.
- [ ] Adicionar `CheckoutSteps` às fases já existentes.
- [ ] Após pagamento, oferecer acesso claro a ingresso e “Meus ingressos”.
- [ ] Testar retorno por `next`, expiração, conflito de assento e replay.

**Checkpoint:** compra completa sem digitar URL ou depender de item bloqueado.

## Fase 5 — Navegação por papel

- [ ] Criar navegação do cliente com somente eventos e ingressos.
- [ ] Criar sidebar do organizador com links reais e estado ativo.
- [ ] Criar header focado da portaria, sem sidebar.
- [ ] Remover todos os placeholders `aria-disabled` da navegação.
- [ ] Adicionar logout e identificação do usuário nos contextos autenticados.

**Checkpoint:** nenhum papel vê ferramentas de outro perfil.

## Fase 6 — Acabamento e validação

- [ ] Revisar 360, 768, 1024 e 1440 px nos temas claro e escuro.
- [ ] Verificar teclado, foco visível, nomes acessíveis e contraste AA.
- [ ] Atualizar screenshots/decisões no README e `docs/DECISIONS.md`.
- [ ] Rodar `format:check`, `lint`, `typecheck`, `test` e `build`.
- [ ] Testar manualmente os quatro estados: visitante, cliente, organizador e portaria.

**Pronto quando:** os 7 critérios de aceite do spec 009 forem demonstráveis e o CI estiver verde.
