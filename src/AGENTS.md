# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo backend.
- O projeto segue as issues `MPJ-14` a `MPJ-17` da fundação do backend.

## Regras Gerais

- Use `pnpm` como gerenciador padrão.
- Use sempre dependências em `latest`.
- Mantenha a estrutura com Turborepo.
- Preserve TypeScript em modo `strict`.
- Preserve ESLint estrito e Prettier.
- Não criar artefatos do backend fora de `/src`.
- Siga os critérios de aceite definidos nas issues do Linear.

## Comandos Principais

Execute a partir de `/src`:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
