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

## Cenários de Integração Registrados

### Autenticação e Sessão

- integração das rotas `/api/auth/*` com o serviço de autenticação;
- propagação da sessão autenticada para proteção das rotas privadas;
- retorno `401` quando a requisição não possui sessão válida.

### Perfil do Negócio

- leitura do perfil consolidado do usuário autenticado em `GET /api/profile`;
- criação automática do perfil quando necessário;
- atualização de dados do negócio em `PUT /api/profile`.

### Clientes

- criação, leitura, atualização e exclusão no escopo do perfil autenticado;
- busca, filtros e paginação na listagem;
- bloqueio de exclusão quando houver vínculos impeditivos.

### Catálogo

- criação e manutenção de itens de catálogo por perfil;
- busca, filtros, ordenação e paginação;
- validação de payload e de identificadores.

### Pedidos

- criação de pedidos com itens de catálogo;
- leitura de pedido unitário e listagem;
- atualização de status conforme as regras do domínio;
- bloqueio de exclusão quando houver impedimentos de negócio.

### Lançamentos Financeiros

- criação de receitas e custos;
- leitura e listagem com filtros por tipo, status e datas;
- atualização de lançamentos;
- bloqueio de exclusão para lançamentos confirmados.

### Documentos Comerciais

- montagem de orçamento, ordem de serviço e recibo a partir dos dados do domínio;
- geração das respostas JSON e PDF;
- retorno `404` para entidades inexistentes;
- retorno `409` quando a emissão não é permitida pelo status atual.

## Observação

Este documento resume a cobertura de integração observável no repositório atual. Detalhamento acadêmico adicional, evidências e rastreabilidade por etapa podem continuar sendo mantidos nos demais artefatos da pasta `docs/`.
