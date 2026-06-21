# Testes de Integração no Backend

## Visão Geral

Neste projeto, os testes automatizados de integração do backend validam o comportamento das rotas e dos módulos principais da API em conjunto, considerando autenticação, validação, regras de negócio e serialização das respostas.

A stack utilizada no repositório é:

- Node.js
- `pnpm`
- Fastify
- Vitest

Os testes ficam em `src/apps/api/src/__tests__/`.

## Execução

Instalação das dependências do monorepo:

```bash
cd src
pnpm install
```

Execução dos testes do backend:

```bash
cd src
pnpm --filter @repo/api test
```

Execução da suíte completa do monorepo:

```bash
cd src
pnpm test
```

## Cobertura Atual Observável no Repositório

Os arquivos de teste hoje presentes no backend incluem:

- `app.test.ts`
- `catalog.test.ts`
- `clients.test.ts`
- `documents.test.ts`
- `orders.test.ts`
- `orders-rules.test.ts`
- `transactions.test.ts`

Esses testes cobrem, no estado atual do código, a integração entre bootstrap da API, autenticação/sessão, rotas de clientes, catálogo, pedidos, lançamentos financeiros, documentos e regras de transição de pedidos.
