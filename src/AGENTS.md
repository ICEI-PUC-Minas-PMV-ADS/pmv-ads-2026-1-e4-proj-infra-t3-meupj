# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo.
- O repositório usa `pnpm` workspaces e `turbo`.
- A documentação humana principal fica em `README.md` na raiz e nos READMEs de cada app.

## Arquitetura Atual

- `apps/api`: backend Fastify + MongoDB + Better Auth + documentos PDF
- `apps/front`: app web em Next.js
- `apps/mobile`: app Expo com suporte web para desenvolvimento
- `packages/eslint-config`: configuração compartilhada de lint
- `packages/tsconfig`: configuração compartilhada de TypeScript

## Regras Operacionais

- Use `pnpm` como gerenciador padrão.
- Use `latest` ao adicionar dependências novas e fixe a versão resolvida no `package.json`.
- Não crie artefatos fora de `/src`.
- Mantenha a lógica do código em inglês.
- Preserve TypeScript em modo `strict`.
- Preserve ESLint e Prettier.
- Sempre verificar `ISSUES.md` antes de iniciar e após concluir qualquer execução.
- Sempre atualizar `AGENTS.md` quando mudanças relevantes alterarem arquitetura, setup, comandos ou regras operacionais.
- Sempre atualizar `ISSUES.md` ao final da execução, conforme o papel atual definido para o arquivo.

## Convenções Locais

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Mobile web: servidor do Expo, normalmente em `http://localhost:8081`
- `apps/front/.env.local` deve definir `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `apps/api/.env.example` é a referência de ambiente da API

## Comandos Principais

Execute a partir de `/src`:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm format`
- `pnpm format:check`
