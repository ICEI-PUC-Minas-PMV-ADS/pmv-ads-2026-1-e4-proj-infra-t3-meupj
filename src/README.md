# MeuPJ

Monorepo de um sistema acadêmico para gestão de pequenos negócios, com backend em Fastify, frontend web em Next.js e app mobile em Expo.

## Visão Geral

O projeto cobre o fluxo principal de operação do negócio:

- autenticação por email e senha
- perfil do negócio
- clientes
- catálogo
- pedidos
- lançamentos financeiros
- emissão de orçamento, ordem de serviço e recibo em PDF

Hoje existem três apps no monorepo:

| App    | Caminho       | Função                                                         |
| ------ | ------------- | -------------------------------------------------------------- |
| API    | `apps/api`    | Regras de negócio, autenticação, MongoDB e documentos PDF      |
| Web    | `apps/front`  | Interface web em Next.js                                       |
| Mobile | `apps/mobile` | Interface mobile em Expo, com suporte web para desenvolvimento |

## Stack

- `pnpm` workspaces + `turbo`
- API: Fastify, TypeScript ESM, MongoDB, Better Auth
- Web: Next.js App Router, React, TypeScript
- Mobile: Expo, React Native, React Navigation, Better Auth Expo

## Funcionalidades Implementadas

- autenticação com sessão por cookie
- leitura e edição do perfil do negócio
- CRUD principal de clientes
- CRUD principal de itens de catálogo
- CRUD principal de pedidos
- CRUD principal de lançamentos
- regras de status em pedidos e lançamentos
- geração de documentos comerciais em JSON e PDF no backend
- preview autenticado de documentos no web
- ações rápidas de contato por telefone e WhatsApp no web e no mobile
- emissão contextual de documentos no web e no mobile

## Estrutura

```text
src/
├── apps/
│   ├── api/
│   ├── front/
│   └── mobile/
├── packages/
│   ├── eslint-config/
│   └── tsconfig/
├── AGENTS.md
└── ISSUES.md
```

## Execução Local

Pré-requisitos:

- Node.js `>= 25`
- `pnpm`
- MongoDB acessível localmente

Instalação:

```bash
pnpm install
```

Execução conjunta:

```bash
pnpm dev
```

Comandos principais na raiz:

```bash
pnpm build
pnpm lint
pnpm test
pnpm format
pnpm format:check
```

Execução isolada por app:

```bash
pnpm --filter @repo/api dev
pnpm --filter front dev
pnpm --filter mobile web
```

## Ambiente Local

Convenção usada no projeto:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Mobile web: servidor do Expo, normalmente em `http://localhost:8081`

Pontos importantes:

- `apps/front/.env.local` deve definir `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `apps/api/.env.example` é a referência de configuração da API
- no mobile, o browser pode usar `EXPO_PUBLIC_API_URL_WEB`, e o native pode usar `EXPO_PUBLIC_API_URL_NATIVE`

## Documentação Complementar

- [API](apps/api/README.md)
- [Web](apps/front/README.md)
- [Mobile](apps/mobile/README.md)

## Estado da Documentação

Esta documentação descreve apenas o estado atual do código. Backlog, histórico de entrega e planejamento ficam fora do README principal.
