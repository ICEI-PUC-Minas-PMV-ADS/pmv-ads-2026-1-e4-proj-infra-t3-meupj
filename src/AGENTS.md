# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo.

## Resumo Atual do Projeto

- Monorepo backend em `/src` gerenciado com Turborepo e workspaces `pnpm`.
- API principal em `apps/api`, construída com Fastify + TypeScript ESM em modo `strict`.
- Configuração compartilhada de engenharia em `packages/tsconfig` e `packages/eslint-config`.
- Configuração de ambiente tipada e validada com `@fastify/env` + TypeBox.
- Camada de dados com MongoDB centralizada em `lib/mongo.ts`, incluindo healthcheck e reconexão.
- Autenticação centralizada com Better Auth (`/api/auth/*`) integrada ao Fastify.
- Adapter MongoDB oficial do Better Auth com persistência de usuários/sessões no banco principal.
- Fluxo de autenticação por email/senha habilitado com sessão via cookie.
- Hook pós-cadastro para criação automática e idempotente do perfil de negócio.
- Model de domínio `profile` com índice único em `authUserId`.
- Model de domínio `catalog` com índices em `profileId` para itens de produto e serviço.
- Endpoint autenticado `GET /api/profile` com resposta sanitizada (sem campos internos de auth).
- Endpoint autenticado `POST /api/catalog` para criação de itens de catálogo.
- Endpoint autenticado `PUT /api/catalog/:itemId` para edição de itens de catálogo no escopo do perfil.
- Endpoint autenticado `DELETE /api/catalog/:itemId` para exclusão de itens de catálogo com validação de vínculo em pedidos.
- Endpoint autenticado `GET /api/catalog` para listagem com paginação, busca, filtros e ordenação.
- Camada base HTTP com CORS, error handler global e endpoint de health (`GET /api/health`).
- Base de qualidade com lint, build, testes automatizados (Vitest) e validação de formatação (Prettier).
- Regras de formatação padronizadas no monorepo (`.prettierignore` e `.prettierrc.json`).

## Regras Gerais

- Use `pnpm` como gerenciador padrão.
- Use `latest` ao adicionar novas dependências e, após instalar, fixe a versão resolvida no `package.json`.
- Mantenha a estrutura com Turborepo.
- Preserve TypeScript em modo `strict`.
- Preserve ESLint estrito e Prettier.
- Não criar artefatos fora de `/src`.
- Siga as descrições e critérios de aceite definidos nas issues do Linear, caso esteja resolvendo uma `ISSUE MAPEADA` em `ISSUES.md`
- Sempre manter a lógica do código em inglês. O contéudo não segue essa restrição.
- Sempre verificar `ISSUES.md` antes de iniciar e após concluir qualquer execução.
- Sempre atualizar `AGENTS.md` quando alterações no projeto impactarem a visão geral, arquitetura, recursos disponíveis, comandos principais ou regras deste documento.
- Sempre atualizar `ISSUES.md` ao final da execução:
  - Seção `ETAPA (): MAPEADAS` com status `[x]/[ ]` das issues da Etapa 2.
  - Seção `GERAL: NÃO MAPEADAS` com itens objetivos de entregas sem vínculo MPJ explícito.

## Recursos

- Estrutura do monorepo:
  - Aplicações em `apps/*`.
  - Pacotes compartilhados em `packages/*`.
  - Orquestração por `turbo.json` e `pnpm-workspace.yaml`.
- Recursos da API (`apps/api`):
  - Servidor Fastify com bootstrap tipado.
  - Roteamento técnico de autenticação Better Auth em `GET|POST /api/auth/*`.
  - Recuperação de sessão autenticada para proteção de endpoints.
  - Store de domínio `profile` com índice único em `authUserId`.
  - Store de domínio `catalog` com índices em `profileId` para itens de produto e serviço.
  - Endpoint `GET /api/profile` com leitura de perfil do usuário autenticado.
  - Coleção Bruno (`apps/api/bruno/meupj`) com requests de health, sign-up, sign-in e profile.
  - Endpoint `POST /api/catalog` com criação de item de catálogo autenticado.
  - Endpoint `PUT /api/catalog/:itemId` com edição de item de catálogo autenticado.
  - Endpoint `DELETE /api/catalog/:itemId` com exclusão de item de catálogo autenticado e validação de vínculos.
  - Endpoint `GET /api/catalog` com listagem autenticada, busca, filtros, ordenação e paginação.
  - Coleção Bruno (`apps/api/bruno/meupj`) com requests de health, sign-up, sign-in, profile e catalog.
  - Variáveis obrigatórias de auth: `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`.
  - Endpoint de health para status de aplicação e dependências.
  - Segurança/CORS e tratamento global de erros.
  - Integração MongoDB com monitoramento de conectividade.
  - Testes automatizados com Vitest.
- Recursos operacionais:
  - Scripts de desenvolvimento, build, lint e teste por workspace.
  - Scripts de formatação e validação de formatação (`format` e `format:check`) por workspace.
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
- `pnpm format`
- `pnpm format:check`
