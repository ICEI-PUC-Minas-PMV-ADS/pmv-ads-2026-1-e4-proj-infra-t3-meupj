# AGENTS

## Contexto

- Este diretório (`/src`) é a raiz do monorepo.

## Resumo Atual do Projeto

- Monorepo backend em `/src` gerenciado com Turborepo e workspaces `pnpm`.
- API principal em `apps/api`, construída com Fastify + TypeScript ESM em modo `strict`.
- Configuração compartilhada de engenharia em `packages/tsconfig` e `packages/eslint-config`.
- Configuração compartilhada de ESLint em `packages/eslint-config` usa preset `typescript-eslint` `recommended` (sem type-check estrito), compatível com o estado atual do `tsconfig` da API.
- Configuração de ambiente tipada e validada com `@fastify/env` + TypeBox.
- Camada de dados com MongoDB centralizada em `lib/mongo.ts`, incluindo healthcheck, reconexão e preservação da instância do client para manter Better Auth funcional após quedas transitórias.
- Autenticação centralizada com Better Auth (`/api/auth/*`) integrada ao Fastify.
- Adapter MongoDB oficial do Better Auth com persistência de usuários/sessões no banco principal.
- Fluxo de autenticação por email/senha habilitado com sessão via cookie.
- Plugin Expo do Better Auth habilitado no backend para suporte oficial ao app mobile (`meupj://` e origens `exp://` em desenvolvimento).
- Hook pós-cadastro para criação automática e idempotente do perfil de negócio.
- Model de domínio `profile` com índice único em `authUserId`.
- Model de domínio `catalog` com índices em `profileId` para itens de produto e serviço.
- Endpoint autenticado `GET /api/profile` com resposta consolidada e sanitizada de `user` e `business` para a tela de configurações.
- Endpoint autenticado `PUT /api/profile` com resposta consolidada de `user` e `business` após edição do perfil do negócio.
- Endpoint autenticado `POST /api/catalog` para criação de itens de catálogo.
- Endpoint autenticado `PUT /api/catalog/:itemId` para edição de itens de catálogo no escopo do perfil.
- Endpoint autenticado `DELETE /api/catalog/:itemId` para exclusão de itens de catálogo com validação de vínculo em pedidos.
- Endpoint autenticado `GET /api/catalog` para listagem com paginação, busca, filtros e ordenação.
- Endpoint autenticado `GET /api/clients/:clientId` para detalhamento de cliente no escopo do perfil.
- Endpoint autenticado `GET /api/orders` com paginação robusta (aceita `page` e `limit` como string numérica de querystring ou inteiro).
- Endpoints autenticados de pedidos retornam `clientName` quando o pedido está vinculado a um cliente do perfil, evitando exibição de `clientId` bruto no front.
- Endpoint autenticado `GET /api/orders/:orderId` para detalhamento de pedido no escopo do perfil.
- Endpoints autenticados de documentos agora expõem tanto JSON estruturado quanto PDF real para orçamento, ordem de serviço e recibo, com regras de disponibilidade por status.
- Camada base HTTP com CORS, error handler global e endpoint de health (`GET /api/health`).
- CORS credenciado da API aceita apenas origens explícitas; `CORS_ORIGIN=*` é ignorado por segurança.
- Bypass de autenticação da API só é efetivo com `NODE_ENV=development`.
- App web (`apps/front`) alinhado ao deploy Node.js da Vercel, sem `output: 'export'`, sem `basePath` de GitHub Pages e com rotas dinâmicas de detalhe/edição servidas sob demanda.
- Frontend web centraliza chamadas HTTP em `apps/front/services/api-client.ts`, sem fallback automático para backend remoto quando `NEXT_PUBLIC_API_URL` estiver ausente.
- Frontend web possui previews autenticados de documentos em `/documentos/*` e ações contextuais nas listas de pedidos e lançamentos para emitir PDF sem depender da tela de detalhe.
- Frontend web possui ações rápidas de contato na lista de clientes, abrindo telefone (`tel:`) e WhatsApp quando o cliente tiver telefone válido cadastrado.
- App mobile (`apps/mobile`) com autenticação real via Better Auth Expo, guarda de sessão na navegação e módulo de Configurações (usuário, negócio e senha).
- App mobile (`apps/mobile`) com suporte de execução web via Expo (`expo start --web` e `expo export --platform web`) com `react-native-web` e versões de `react`/`react-dom` alinhadas.
- Cliente Better Auth do mobile aplica plugin Expo apenas em plataformas nativas; no web usa cliente padrão para evitar dependência de SecureStore no navegador.
- App mobile (`apps/mobile`) possui ações rápidas de contato na lista de clientes, com telefone (`tel:`) e WhatsApp quando houver número válido.
- App mobile (`apps/mobile`) possui ações contextuais de documentos nas listas de pedidos e lançamentos, abrindo PDF autenticado no web e baixando/compartilhando externamente no nativo.
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
  - Endpoint `GET /api/profile` com leitura consolidada (`user` + `business`) do perfil autenticado.
  - Endpoint `PUT /api/profile` com edição de dados do negócio e retorno consolidado (`user` + `business`).
  - Coleção Bruno (`apps/api/bruno/meupj`) com requests de health, sign-up, sign-in e profile.
  - Endpoint `POST /api/catalog` com criação de item de catálogo autenticado.
  - Endpoint `PUT /api/catalog/:itemId` com edição de item de catálogo autenticado.
  - Endpoint `DELETE /api/catalog/:itemId` com exclusão de item de catálogo autenticado e validação de vínculos.
  - Endpoint `GET /api/catalog` com listagem autenticada, busca, filtros, ordenação e paginação.
  - Endpoint `GET /api/clients/:clientId` com leitura de cliente autenticado por id no escopo do perfil.
  - Endpoint `GET /api/orders` com listagem autenticada e normalização segura de `page`/`limit` vindos da querystring.
  - Endpoints de pedidos enriquecem a resposta com `clientName` quando houver cliente vinculado no perfil autenticado.
  - Endpoint `GET /api/orders/:orderId` com leitura de pedido autenticado por id no escopo do perfil.
  - Endpoints `GET /api/documents/budget/:orderId`, `GET /api/documents/service-order/:orderId` e `GET /api/documents/receipt/:transactionId` preservam o payload JSON de documentos.
  - Endpoints `GET /api/documents/budget/:orderId/pdf`, `GET /api/documents/service-order/:orderId/pdf` e `GET /api/documents/receipt/:transactionId/pdf` geram `application/pdf` no backend com `Content-Disposition` e bloqueio por status inválido (`409`).
  - Coleção Bruno (`apps/api/bruno/meupj`) com requests de health, sign-up, sign-in, profile e catalog.
  - Variáveis obrigatórias de auth: `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`.
  - Endpoint de health para status de aplicação e dependências.
  - Segurança/CORS e tratamento global de erros, com CORS credenciado restrito a origens explícitas.
  - Helper compartilhado de paginação em `apps/api/src/lib/pagination.ts` para alinhar `page`/`limit` entre módulos HTTP.
  - Integração MongoDB com monitoramento de conectividade e reconexão compatível com o adapter MongoDB do Better Auth.
  - Testes automatizados com Vitest.
- Recursos operacionais:
  - Scripts de desenvolvimento, build, lint e teste por workspace.
  - Scripts de formatação e validação de formatação (`format` e `format:check`) por workspace.
  - Frontend com rota autenticada `/configuracoes` para edição de perfil do usuário, dados da empresa e alteração de senha.
  - Frontend expõe ações operacionais de contato na listagem de clientes via menu por item, sem necessidade de nova integração backend.
  - Frontend possui páginas autenticadas de preview para `/documentos/orcamento/[orderId]`, `/documentos/ordem-servico/[orderId]` e `/documentos/recibo/[transactionId]`, com abertura em nova aba e download do PDF retornado pela API.
  - Frontend Next.js usa o runtime padrão de servidor em produção (`next build` + `next start` / Vercel), preservando rotas dinâmicas reais como `/clientes/[id]`, `/catalogo/[itemId]`, `/pedidos/[id]` e `/dashboard/editar/[id]`.
- Mobile com tela autenticada de configurações para edição de usuário/empresa e alteração de senha.
- Mobile resolve a API por plataforma, com `EXPO_PUBLIC_API_URL_WEB` opcional para browser, `EXPO_PUBLIC_API_URL_NATIVE` opcional para native e fallback local seguro para `http://localhost:3001` no web em `localhost`/`127.0.0.1`, evitando quebra do Expo web por IP de rede em `.env`.
- Mobile usa scheme `meupj` para deep link de autenticação no Better Auth Expo.
  - Mobile compartilha utilitário de telefone para máscara, normalização BR, `tel:` e `wa.me`, evitando divergência entre cadastro e ações operacionais.
  - Mobile usa `expo-file-system` e `expo-sharing` para handoff externo de PDFs autenticados em plataformas nativas.
  - Mobile expõe menu operacional por item em clientes, pedidos e lançamentos recentes, sem depender de tela de detalhe para contato rápido ou emissão de documento.
  - Padrão local para execução simultânea: frontend em `http://localhost:3000` e API em `http://localhost:3001`.
  - Frontend deve definir `NEXT_PUBLIC_API_URL=http://localhost:3001` em `apps/front/.env.local` para alinhar todas as chamadas HTTP.
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
