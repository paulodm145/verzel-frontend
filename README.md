# Verzel Frontend — Eventos e Ingressos

![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Testes](https://img.shields.io/badge/testes-106%20aprovados-2E7D32)

Frontend do desafio Elite Dev da Verzel. A aplicação cobre a jornada completa de uma plataforma de eventos: cliente escolhe assento e simula o pagamento, organizador cria e publica eventos, e portaria valida ingressos por QR Code ou código manual.

## Stack

- Next.js 16.3 com App Router e BFF
- React 19, TypeScript e Tailwind CSS 4
- TanStack Query e TanStack Table
- React Hook Form e Zod
- Zustand
- Vitest, Testing Library e MSW

## Como rodar

Pré-requisitos: Node.js 20.19 ou superior, npm e o backend da API na porta `3000`.

```bash
npm ci
cp .env.example .env
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001). A raiz encaminha ao login ou à área correspondente à sessão atual.

O `.env.example` usa:

```dotenv
API_URL=http://localhost:3000
SESSION_COOKIE_SECURE=false
```

## Usuários do seed

| Papel       | E-mail                    | Senha            |
| ----------- | ------------------------- | ---------------- |
| Organizador | `organizador@verzel.test` | `organizador123` |
| Cliente     | `cliente1@verzel.test`    | `cliente123`     |
| Portaria    | `portaria@verzel.test`    | `portaria123`    |

## Validando um ingresso na portaria

Entre com `portaria@verzel.test`. O login já cai em `/check-in` — é a tela exclusiva desse papel, sem sidebar, para sobrar espaço ao leitor.

1. Escolha **o evento desta porta**. Sem isso nada é validado: é o que permite distinguir "ingresso de outro evento" de "ingresso inválido".
2. Aponte a câmera para o QR do ingresso, ou digite o código em `TKT-XXXX-XXXX-XXXX`. A digitação está sempre visível, porque câmera é negada, falha e demora.
3. O resultado ocupa a tela inteira por 2 segundos, com cor **e** ícone próprios: liberado, já utilizado, de outro evento ou inválido. Os 2 segundos também são a trava que evita ler o mesmo QR duas vezes e mostrar "já utilizado" logo depois de "liberado".

### Pelo celular, apontando a câmera nativa

O QR carrega a **URL pública do ingresso**. Apontar a câmera do iPhone ou do Android abre `/ticket/TKT-…`, que mostra o ingresso: evento, data, local, assento, código e situação.

Se quem abriu for a portaria, a página oferece **"Validar na portaria"**, que leva a `/check-in` já com o código preenchido — falta escolher o evento da porta e confirmar. Sem sessão, o mesmo botão passa pelo login carregando o destino.

Ou seja: dá para validar sem usar o leitor da própria tela, só com a câmera do sistema. O leitor embutido continua sendo o caminho rápido para uma fila, porque não exige abrir página por ingresso.

## Arquitetura

O navegador fala somente com o Next. Login e refresh ficam no BFF e os tokens permanecem em cookies `httpOnly`; chamadas de domínio passam pelo proxy `/api/v/*`. Dados remotos pertencem ao TanStack Query, enquanto Zustand guarda apenas estado efêmero de fluxo e preferências de UI.

As decisões e limitações estão detalhadas em [docs/DECISIONS.md](docs/DECISIONS.md). Os contratos consumidos estão em [docs/doc-frontend](docs/doc-frontend) e o progresso rastreável em [docs/BACKLOG.md](docs/BACKLOG.md).

## Qualidade

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes priorizam lógica cujo defeito tem custo real: refresh single-flight, idempotência, expiração de reserva, conflitos de assento, estados da portaria, trava do scanner, formulários e tabela server-side. Markup trivial não é testado isoladamente.

## Próximos passos

- testes E2E com Playwright cobrindo compra e check-in reais;
- lock distribuído do refresh em Redis para múltiplas instâncias;
- observabilidade de erros por `requestId`;
- execução periódica de auditoria de acessibilidade e contraste no CI.

O uso de ferramentas de IA durante o desenvolvimento está registrado em [docs/USO-DE-IA.md](docs/USO-DE-IA.md).
