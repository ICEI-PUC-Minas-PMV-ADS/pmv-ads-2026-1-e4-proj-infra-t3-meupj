# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo.

## Resumo Atual do Projeto

- Monorepo backend em `/src` gerenciado com Turborepo e workspaces `pnpm`.
- API principal em `apps/api`, construída com Fastify + TypeScript ESM em modo `strict`.
- Configuração compartilhada de engenharia em `packages/tsconfig` e `packages/eslint-config`.
- Configuração de ambiente tipada e validada com `@fastify/env` + TypeBox.
- Camada de dados com MongoDB centralizada em `lib/mongo.ts`, incluindo healthcheck e reconexão.
- Camada base HTTP com CORS, error handler global e endpoint de health (`GET /health`).
- Base de qualidade com lint, build e testes automatizados (Vitest).
- Regras de formatação padronizadas no monorepo (`.prettierignore` e `.prettierrc.json`).

## Regras Gerais

- Use `pnpm` como gerenciador padrão.
- Use `latest` ao adicionar novas dependências e, após instalar, fixe a versão resolvida no `package.json`.
- Mantenha a estrutura com Turborepo.
- Preserve TypeScript em modo `strict`.
- Preserve ESLint estrito e Prettier.
- Não criar artefatos fora de `/src`.
- Siga as descrições e critérios de aceite definidos nas issues do Linear, caso esteja resolvendo uma `ISSUE MAPEADA` em `ISSUES.md`
- Sempre verificar `ISSUES.md` antes de iniciar e após concluir qualquer execução.
- Sempre atualizar `AGENTS.md` quando alterações no projeto impactarem a visão geral, arquitetura, recursos disponíveis, comandos principais ou regras deste documento.
- Sempre atualizar `ISSUES.md` ao final da execução:
  - Seção `ETAPA 2 - MAPEADAS` com status `[x]/[ ]` das issues da Etapa 2.
  - Seção `ETAPA 2 - NÃO MAPEADAS` com itens objetivos de entregas sem vínculo MPJ explícito.

## Recursos

- Estrutura do monorepo:
  - Aplicações em `apps/*`.
  - Pacotes compartilhados em `packages/*`.
  - Orquestração por `turbo.json` e `pnpm-workspace.yaml`.
- Recursos da API (`apps/api`):
  - Servidor Fastify com bootstrap tipado.
  - Endpoint de health para status de aplicação e dependências.
  - Segurança/CORS e tratamento global de erros.
  - Integração MongoDB com monitoramento de conectividade.
  - Testes automatizados com Vitest.
- Recursos operacionais:
  - Scripts de desenvolvimento, build, lint e teste por workspace.
  - Execução isolada por filtro: `pnpm --filter <projeto> <comando>`.
  - Referência prática da API: `pnpm --filter @repo/api <comando>`.
  - Execução global via Turborepo a partir da raiz `/src`.

## Comandos Principais

Execute a partir de `/src`:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
