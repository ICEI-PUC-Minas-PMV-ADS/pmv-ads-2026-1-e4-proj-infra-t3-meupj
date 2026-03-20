# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo.

## Resumo Atual do Projeto

- Monorepo backend com Turborepo e workspaces `pnpm` em `/src`.
- API principal em `apps/api` com Fastify + TypeScript ESM em modo `strict`.
- Variáveis de ambiente validadas com `@fastify/env` + TypeBox.
- Conexão com MongoDB centralizada em `lib/mongo.ts`, com healthcheck e reconexão.
- Checks principais estabelecidos: `pnpm build`, `pnpm lint` e `pnpm test`.

## Regras Gerais

- Use `pnpm` como gerenciador padrão.
- Use sempre dependências em `latest`.
- Mantenha a estrutura com Turborepo.
- Preserve TypeScript em modo `strict`.
- Preserve ESLint estrito e Prettier.
- Não criar artefatos fora de `/src`.
- Siga as descrições e critérios de aceite definidos nas issues do Linear, caso esteja resolvendo uma `ISSUE MAPEADA` em `ISSUES.md`
- Sempre verificar `ISSUES.md` antes de iniciar e após concluir qualquer execução.
- Sempre atualizar `ISSUES.md` ao final da execução:
  - Seção `ETAPA 2 - MAPEADAS` com status `[x]/[ ]` das issues da Etapa 2.
  - Seção `ETAPA 2 - NÃO MAPEADAS` com itens objetivos de entregas sem vínculo MPJ explícito.

## Recursos

- Para executar um único projeto no monorepo, use filtro de workspace: `pnpm --filter <projeto> <comando>`.
- Para a API deste repositório, referência prática: `pnpm --filter @repo/api <comando>`.
- Quando necessário executar todos os projetos, mantenha o uso do Turborepo pela raiz.

## Comandos Principais

Execute a partir de `/src`:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
