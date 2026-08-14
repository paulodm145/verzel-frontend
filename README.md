# Verzel Frontend — Plataforma de Eventos e Ingressos

Frontend do desafio Elite Dev (Verzel): uma plataforma de eventos e ingressos com três papéis de usuário — cliente (compra ingressos), organizador (cadastra e gerencia eventos) e portaria (valida ingressos na entrada). Construído em Next.js (App Router) com TypeScript, consumindo uma API REST que roda como projeto separado.

Este README cobre apenas o essencial para clonar, instalar e rodar o projeto localmente. A seção de decisões de arquitetura, os badges de tecnologia e a estratégia de testes chegam no epic de entrega (08) — se você está lendo isso antes disso existir, não é um README incompleto por descuido, é escopo proposital desta etapa.

## Pré-requisitos

- **Node.js 20.19 ou superior** (`jsdom` e `@vitejs/plugin-react`, usados nos testes, exigem 20.19+). O CI do projeto builda em Node 22 — se você tiver 22 disponível, prefira usar essa versão para ficar o mais próximo possível do ambiente de verificação, mas 20.19+ funciona.
- **npm** (o projeto usa `package-lock.json`).
- **Backend da API rodando na porta `3000`.** Este repositório é só o frontend; sem a API no ar, o login, o cadastro e qualquer chamada de dados (eventos, ingressos etc.) respondem erro de rede — as telas de produto ainda não existem neste ponto do projeto, chegam a partir do epic 02. As instruções de subida do backend estão no repositório dele (`docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev`).

## Como rodar

```bash
npm ci
cp .env.example .env
npm run dev
```

Abra [http://localhost:3001](http://localhost:3001).

O `.env` criado a partir do `.env.example` já aponta `API_URL` para `http://localhost:3000` — ajuste se o backend estiver em outro endereço.

## Scripts disponíveis

| Script         | Comando              | Descrição                                        |
| -------------- | -------------------- | ------------------------------------------------ |
| `dev`          | `next dev -p 3001`   | Sobe o servidor de desenvolvimento na porta 3001 |
| `build`        | `next build`         | Gera o build de produção                         |
| `start`        | `next start -p 3001` | Serve o build de produção na porta 3001          |
| `lint`         | `eslint .`           | Roda o linter                                    |
| `format`       | `prettier --write .` | Formata os arquivos                              |
| `format:check` | `prettier --check .` | Verifica formatação sem alterar arquivos         |
| `typecheck`    | `tsc --noEmit`       | Verifica os tipos sem gerar build                |
| `test`         | `vitest run`         | Roda a suíte de testes uma vez                   |
| `test:watch`   | `vitest`             | Roda a suíte de testes em modo watch             |

## Nota sobre as portas

O backend ocupa a porta `3000`. Por isso este frontend roda na porta `3001` (configurado nos scripts `dev` e `start`) — as duas aplicações sobem em paralelo sem conflito.
