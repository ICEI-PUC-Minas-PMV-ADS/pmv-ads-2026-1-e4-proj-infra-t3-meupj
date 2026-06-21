# API

Backend principal do projeto, responsável por autenticação, persistência, regras de negócio e geração de documentos PDF.

## Stack

- Fastify
- TypeScript ESM
- MongoDB
- Better Auth
- `@react-pdf/renderer`

## Módulos HTTP

| Grupo       | Rotas                                  |
| ----------- | -------------------------------------- |
| Auth        | `/api/auth/*`                          |
| Perfil      | `GET /api/profile`, `PUT /api/profile` |
| Clientes    | `/api/clients`                         |
| Catálogo    | `/api/catalog`                         |
| Pedidos     | `/api/orders`                          |
| Lançamentos | `/api/transactions`                    |
| Documentos  | `/api/documents/*`                     |
| Saúde       | `GET /api/health`                      |

## Comportamento Atual

- autenticação por sessão com Better Auth
- proteção de rotas por sessão autenticada
- CORS credenciado com allowlist explícita
- bypass de autenticação restrito a `NODE_ENV=development`
- paginação compartilhada entre clientes, catálogo, pedidos e lançamentos
- pedidos retornam `clientName` quando existe vínculo com cliente
- documentos comerciais disponíveis em JSON e PDF

## Documentos

Documentos suportados:

- orçamento
- ordem de serviço
- recibo

Rotas PDF:

- `GET /api/documents/budget/:orderId/pdf`
- `GET /api/documents/service-order/:orderId/pdf`
- `GET /api/documents/receipt/:transactionId/pdf`

As rotas PDF retornam `application/pdf` e aplicam regras de disponibilidade por status.

## Execução Local

Instalar dependências na raiz:

```bash
pnpm install
```

Rodar a API:

```bash
pnpm --filter @repo/api dev
```

Build, lint e testes:

```bash
pnpm --filter @repo/api build
pnpm --filter @repo/api lint
pnpm --filter @repo/api test
```

## Ambiente

Arquivo de referência:

- `apps/api/.env.example`

Variáveis principais:

- `PORT`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- `ENABLE_DEV_BYPASS`

No setup local do projeto, a convenção é rodar a API em `http://localhost:3001`.
