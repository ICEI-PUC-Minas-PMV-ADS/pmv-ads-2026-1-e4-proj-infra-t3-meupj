# Web

Aplicação web do projeto em Next.js, usada para operação principal no navegador.

## Stack

- Next.js App Router
- React
- TypeScript
- `lucide-react`

## Módulos Atuais

- autenticação
- dashboard financeiro
- clientes
- catálogo
- pedidos
- configurações
- preview de documentos

## Rotas Principais

Auth:

- `/login`
- `/cadastro`

Área autenticada:

- `/dashboard`
- `/dashboard/novo`
- `/dashboard/editar/[id]`
- `/clientes`
- `/clientes/novo`
- `/clientes/[id]`
- `/catalogo`
- `/catalogo/novo`
- `/catalogo/[itemId]`
- `/pedidos`
- `/pedidos/novo`
- `/pedidos/[id]`
- `/configuracoes`

Preview de documentos:

- `/documentos/orcamento/[orderId]`
- `/documentos/ordem-servico/[orderId]`
- `/documentos/recibo/[transactionId]`

## Comportamento Atual

- chamadas HTTP centralizadas em `services/api-client.ts`
- `NEXT_PUBLIC_API_URL` obrigatório
- listagem de pedidos usa `clientName` quando fornecido pela API
- listas de clientes, pedidos e lançamentos expõem ações operacionais diretamente na UI
- documentos PDF são abertos a partir da API autenticada

## Execução Local

Instalar dependências na raiz:

```bash
pnpm install
```

Rodar o web:

```bash
pnpm --filter front dev
```

Build e lint:

```bash
pnpm --filter front build
pnpm --filter front lint
```

## Ambiente

Arquivo esperado no desenvolvimento local:

- `apps/front/.env.local`

Variável obrigatória:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

No setup local do projeto, a convenção é usar o web em `http://localhost:3000`.
