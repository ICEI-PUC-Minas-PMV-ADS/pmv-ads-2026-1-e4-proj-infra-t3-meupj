# Plano de Desenvolvimento: Lançamentos e Documentos

## Visão Geral

Este documento registra o plano de desenvolvimento para a funcionalidade de **Lançamentos e Documentos** no projeto. Sou responsável por implementar as issues MPJ-43 a MPJ-50, conforme definido no arquivo `src/ISSUES.MD`. O objetivo é criar um sistema completo para gerenciar lançamentos financeiros (receitas e custos) e gerar documentos comerciais (orçamento, ordem de serviço e recibo).

## Análise de Dependências

Após análise dos commits anteriores (feitos pelo colega Eric na branch `feat/pedidos` e merged em `dev`):

- **Pedidos (MPJ-38 a MPJ-42)**: Totalmente implementado, incluindo schema, criação, edição, exclusão, listagem e transições de status.
- **Estrutura de Pedidos**: Usa collection `orders` com campos como `profileId`, `clientId`, `orderNumber`, `status`, `paymentMethods`, `items` (OrderItemSnapshot), `total`, etc.
- **Transactions Existente**: Há uma base com collection `transactions` (TransactionType: 'income' | 'expense'), mas sem rotas implementadas ainda.
- **Dependência**: Lançamentos dependem de pedidos para associar receitas (ex.: venda completada) e custos (ex.: itens de pedido).

## Issues a Serem Desenvolvidas

As seguintes issues fazem parte deste escopo:

- **MPJ-43**: Criar schema e índices da collection lançamentos

  - Descrição: Definir a estrutura de dados para a collection `lancamentos` no MongoDB, incluindo campos para tipo (receita/custo), valor, data, descrição, etc. Criar índices apropriados para otimização de consultas. Possivelmente estender ou usar a collection `transactions` existente.
  - Status: Concluído
  - Prioridade: Alta (base para as demais)
  - Dependências Técnicas: Basear-se no schema de `transactions` existente, integrar com `orders` para orderId.
  - **Detalhes Técnicos Implementados**:
    - **Arquivo Alterado**: `src/apps/api/src/lib/transactions.ts`
    - **Mudanças no Schema**:
      - Adicionado `transactionDate: Date` (obrigatório, conforme specs).
      - Adicionado `category?: string` (opcional).
      - Adicionado `notes?: string` (opcional).
      - Adicionado `clientId?: string` (opcional, para associar cliente).
      - Ajustado `dueDate` para opcional (era obrigatório).
      - Removido `paidDate` (não usado nas specs).
      - Ajustado `TransactionStatus` de `'pending' | 'paid' | 'cancelled'` para `'pending' | 'confirmed' | 'cancelled'` (incluindo `'confirmed'` para confirmação).
    - **Índices Adicionados**:
      - `transactions_profileId_transactionDate`: Para consultas por data de transação.
      - `transactions_profileId_type`: Para filtrar por tipo (income/expense).
      - `transactions_profileId_status`: Para filtrar por status.
      - `transactions_profileId_clientId`: Para associar a clientes (sparse, pois opcional).
    - **Compatibilidade**: Extensão não quebra código existente; campos novos são opcionais exceto `transactionDate`.
    - **Data de Implementação**: 10 de abril de 2026.
- **MPJ-44**: Implementar criação de lançamento de receita

  - Descrição: Desenvolver endpoint e lógica para criar novos lançamentos do tipo receita, com validações e integração com o schema definido. Associar a pedidos completados para gerar receita automática.
  - Status: Concluído
  - Dependências: MPJ-43, pedidos (já implementado)
  - Implementação recente:
    - Rota `POST /api/transactions/income` adicionada em `src/apps/api/src/routes/transactions.ts`.
    - Registro de rota em `src/apps/api/src/app.ts`.
    - Adicionada validação TypeBox para payload e resposta.
    - Inclusão de lógica de autenticação via `authService` e associação de `profileId`.
    - Testes adicionados em `src/apps/api/src/__tests__/transactions.test.ts` cobrindo criação autenticada, falha de cliente inválido e bloqueio de requisição não autenticada.
    - Ajustes de lint feitos para garantir que os novos arquivos estejam limpos com as regras do projeto.
  - Data de Implementação: 10 de abril de 2026
- **MPJ-45**: Implementar criação de lançamento de custo

  - Descrição: Desenvolver endpoint e lógica para criar novos lançamentos do tipo custo, com validações e integração com o schema definido. Possivelmente associar a itens de pedidos ou custos operacionais.
  - Status: Concluído
  - Dependências: MPJ-43
  - Implementação recente:
    - Rota `POST /api/transactions/expense` adicionada em `src/apps/api/src/routes/transactions.ts`.
    - Reutilização de validação TypeBox para payload de transação.
    - Inclusão de lógica de autenticação via `authService` e associação de `profileId`.
    - Testes adicionados em `src/apps/api/src/__tests__/transactions.test.ts` cobrindo criação de despesa autenticada.
    - Correções de lint aplicadas para manter os novos arquivos alinhados às regras do projeto.
- **MPJ-46**: Implementar listagem, busca e filtros de lançamentos

  - Descrição: Criar endpoints para listar lançamentos com suporte a filtros (por data, tipo, valor, pedido associado, etc.) e busca textual.
  - Status: Concluído
  - Dependências: MPJ-43, MPJ-44, MPJ-45
- **MPJ-47**: Implementar edição, exclusão e confirmação de lançamentos

  - Descrição: Desenvolver endpoints para editar, excluir e confirmar lançamentos, com regras de negócio (ex.: não permitir exclusão de lançamentos confirmados ou associados a pedidos finalizados).
  - Status: Concluído
  - Dependências: MPJ-43, MPJ-44, MPJ-45
- **MPJ-48**: Criar serviço de montagem de orçamento

  - Descrição: Implementar serviço para gerar documentos de orçamento baseados em lançamentos e itens do catálogo.
  - Status: Concluído
  - Dependências: MPJ-43 a MPJ-47, catálogo (já implementado)
- **MPJ-49**: Criar serviço de montagem de ordem de serviço

  - Descrição: Implementar serviço para gerar documentos de ordem de serviço baseados em pedidos e lançamentos.
  - Status: Concluído
  - Dependências: MPJ-43 a MPJ-47, pedidos (já implementado)
- **MPJ-50**: Criar serviço de montagem de recibo

  - Descrição: Implementar serviço para gerar recibos baseados em lançamentos confirmados.
  - Status: Concluído
  - Dependências: MPJ-43 a MPJ-47

## Histórico e Referências

- **Data de Início**: 10 de abril de 2026
- **Branch Atual**: feat/lançamentos/documentos (criada a partir de dev)
- **Fonte das Issues**: Arquivo `src/ISSUES.MD`
- **Tecnologias Envolvidas**: Fastify (API), MongoDB (banco), TypeScript, Better Auth (autenticação)
- **Commits Analisados**:
  - Pedidos: Commits de c4b6d41 a 471c57f (schema, CRUD, listagem)
  - Transactions: Collection existente em `lib/transactions.ts` (base para lançamentos)
- **Decisões Iniciais**:
  - Seguir padrões já estabelecidos no projeto (ex.: schemas de clientes, catálogo, pedidos).
  - Usar validações rigorosas para lançamentos financeiros.
  - Integrar com autenticação para associar lançamentos ao usuário logado.
  - Possivelmente renomear/extender `transactions` para `lancamentos` ou criar nova collection.
  - Priorizar MPJ-43 como primeiro passo para estabelecer a base de dados.

## Plano de Execução Proposto

1. **Fase 1: Schema e Infraestrutura (MPJ-43)**

   - Definir schema final para `lancamentos` (baseado em `transactions` + campos adicionais se necessário).
   - Criar índices para profileId, orderId, type, date, status.
   - Implementar store em `lib/lancamentos.ts` (ou estender transactions).
2. **Fase 2: CRUD Básico (MPJ-44, MPJ-45, MPJ-46, MPJ-47)**

   - Criar rotas em `routes/lancamentos.ts`.
   - Implementar criação de receita (associada a pedidos) e custo.
   - Adicionar listagem com filtros (data, tipo, pedido).
   - Implementar edição/exclusão com validações.
3. **Fase 3: Documentos (MPJ-48, MPJ-49, MPJ-50)**

   - Criar serviços em `lib/` para geração de documentos.
   - Integrar com catálogo e pedidos.
   - Adicionar endpoints para expor documentos.

## Próximos Passos

MPJ-43 a MPJ-51 foram concluídos. O próximo passo é iniciar MPJ-52: criar endpoint de resumo de receitas.

## Registro de alterações

- **MPJ-44 concluído** em 10 de abril de 2026:
  - Adicionada rota `POST /api/transactions/income` em `src/apps/api/src/routes/transactions.ts`.
  - Registrada rota em `src/apps/api/src/app.ts`.
  - Implementada validação de payload e resposta com TypeBox.
  - Associado `profileId` à sessão autenticada usando `authService` e `profileStore`.
  - Criados testes de integração em `src/apps/api/src/__tests__/transactions.test.ts` para:
    - criação de receita autenticada;
    - falha quando o cliente não existe ou não pertence ao perfil;
    - bloqueio de requisição não autenticada.
  - Aplicadas correções de lint para manter os novos arquivos alinhados às regras do projeto.

- **MPJ-45 concluído** em 10 de abril de 2026:
  - Adicionada rota `POST /api/transactions/expense` em `src/apps/api/src/routes/transactions.ts`.
  - Reutilização de validação TypeBox para payload de transação.
  - Inclusão de lógica de autenticação via `authService` e associação de `profileId`.
  - Criados testes de integração em `src/apps/api/src/__tests__/transactions.test.ts` para:
    - criação de despesa autenticada;
    - verificação de requisição não autenticada.
  - Aplicadas correções de lint para manter os novos arquivos alinhados às regras do projeto.

- **MPJ-46 concluído** em 10 de abril de 2026:
  - Adicionada rota `GET /api/transactions` em `src/apps/api/src/routes/transactions.ts`.
  - Implementada paginação (`page`, `limit`) com ordenação (`sortBy`, `sortOrder`) e totalização.
  - Implementados filtros por `type`, `status`, `clientId`, `orderId`, `paymentMethod`, `category`, intervalo de `transactionDate`, intervalo de `createdAt` e busca textual (`q`).
  - Implementada derivação de `displayStatus` com regra de atraso (`overdue`) sem persistência no banco.
  - Criados testes de integração em `src/apps/api/src/__tests__/transactions.test.ts` para listagem paginada e filtro por tipo.

- **MPJ-47 concluído** em 10 de abril de 2026:
  - Adicionada rota `PUT /api/transactions/:transactionId` para edição protegida com escopo por `profileId`.
  - Adicionada rota `DELETE /api/transactions/:transactionId` para exclusão protegida com bloqueio de registros confirmados (`409`).
  - Adicionada rota `PATCH /api/transactions/:transactionId/confirm` para confirmação idempotente (`status = confirmed`).
  - Implementado contrato de erros para `404` (recurso fora do escopo/inexistente) e `409` (conflito de exclusão).
  - Criados testes de integração cobrindo edição, confirmação idempotente, bloqueio de exclusão de confirmado e `404` para recurso inexistente.

- **MPJ-48 concluído** em 10 de abril de 2026:
  - Criado serviço `buildBudgetDocument` em `src/apps/api/src/lib/documents.ts` para montagem do payload de orçamento.
  - Adicionada rota protegida `GET /api/documents/budget/:orderId` em `src/apps/api/src/routes/documents.ts`.
  - Aplicado escopo por `profileId` para busca de pedido e cliente associado.
  - Implementadas respostas `401` (não autenticado), `404` (pedido inexistente/fora do escopo) e `200` com documento JSON.
  - Rota registrada em `src/apps/api/src/app.ts`.
  - Criados testes de integração em `src/apps/api/src/__tests__/documents.test.ts` cobrindo casos de `401`, `404` e sucesso com payload de orçamento.

- **MPJ-49 concluído** em 10 de abril de 2026:
  - Criado serviço `buildServiceOrderDocument` em `src/apps/api/src/lib/documents.ts` para montagem do payload de ordem de serviço.
  - Adicionada rota protegida `GET /api/documents/service-order/:orderId` em `src/apps/api/src/routes/documents.ts`.
  - Mantido escopo por `profileId` para busca de pedido e cliente associado.
  - Implementadas respostas `401` (não autenticado), `404` (pedido inexistente/fora do escopo) e `200` com documento JSON.
  - Criados testes de integração em `src/apps/api/src/__tests__/documents.test.ts` cobrindo casos de `401`, `404` e sucesso com payload de ordem de serviço.

- **MPJ-50 concluído** em 10 de abril de 2026:
  - Criado serviço `buildReceiptDocument` em `src/apps/api/src/lib/documents.ts` para montagem do payload de recibo a partir de lançamento confirmado.
  - Adicionada rota protegida `GET /api/documents/receipt/:transactionId` em `src/apps/api/src/routes/documents.ts`.
  - Implementado escopo por `profileId` e filtro de `status = confirmed` para geração de recibo.
  - Implementadas respostas `401` (não autenticado), `404` (lançamento inexistente/fora do escopo/não confirmado) e `200` com documento JSON.
  - Criados testes de integração em `src/apps/api/src/__tests__/documents.test.ts` cobrindo casos de `401`, `404` e sucesso com payload de recibo.

- **MPJ-51 concluído** em 10 de abril de 2026:
  - Expostos os endpoints protegidos de documentos comerciais em `src/apps/api/src/routes/documents.ts`:
    - `GET /api/documents/budget/:orderId`
    - `GET /api/documents/service-order/:orderId`
    - `GET /api/documents/receipt/:transactionId`
  - Aplicado escopo por `profileId` em todas as buscas de pedido, cliente e lançamento.
  - Padronizados contratos de erro para `401` e `404` nos recursos inexistentes/fora do escopo.
  - Cobertura de integração consolidada em `src/apps/api/src/__tests__/documents.test.ts`.

## Seed Mock para Teste de Schema
- **Arquivo criado**: `src/apps/api/src/scripts/seed-transactions.ts`
- **Objetivo**: popular a collection `transactions` com dados de exemplo e validar o schema estendido sem depender de endpoints existentes.
- **Como usar**:
  1. Preferencialmente passe a URI diretamente pelos parâmetros do comando.
  2. Execute `cd src/apps/api && pnpm seed:transactions -- --uri="<MONGODB_URI>" --db="<MONGODB_DB_NAME>"`.
  3. Se preferir, ainda é possível usar `src/apps/api/.env` como fallback.
- **O que o script faz**:
  - conecta ao MongoDB usando a URI recebida por CLI ou a mesma `MONGODB_URI` do projeto;
  - insere transações de exemplo com `type`, `status`, `amount`, `transactionDate`, `dueDate`, `category`, `paymentMethod`, `clientId`, `reference`, `notes`, `createdAt` e `updatedAt`;
  - lista os índices existentes na collection `transactions`.

> Isso permite validar MPJ-43 com dados reais antes de avançar para as rotas de criação de receita e custo.


Contexto Adicional:

**Descrição**
Implementar edição, exclusão e confirmação de transações com regras de status e integridade.

**Critérios de aceite**

* Criar endpoint protegido `PUT /api/transactions/:transactionId` para edição.
* Criar endpoint protegido `DELETE /api/transactions/:transactionId` para exclusão.
* Criar endpoint protegido `PATCH /api/transactions/:transactionId/confirm` para confirmação.
* Operações devem respeitar escopo por `profileId`.
* Edição atualiza `updatedAt` e valida campos numéricos/enums.
* Confirmação altera `status` para `confirmed` (idempotente se já confirmado).
* Exclusão deve respeitar regra de bloqueio para registros confirmados quando aplicável (retornar `409`).
* Recurso inexistente no escopo retorna `404`.
* Erros retornam contrato `{ error, message, statusCode }`.

Implementar criação de lançamento de custo

**Descrição**
Implementar criação de transação de custo com endpoint protegido e validações de negócio.

**Critérios de aceite**

* Criar endpoint protegido `POST /api/transactions/expense` (sessão Better Auth obrigatória).
* `type` deve ser fixado como `expense` pela regra do endpoint.
* Payload mínimo: `amount`, `transactionDate`; campos opcionais: `dueDate`, `orderId`, `clientId`, `category`, `paymentMethod`, `reference`, `notes`.
* Resolver `profileId` a partir da sessão; não aceitar `profileId` no payload.
* Status inicial padrão: `pending` (com possibilidade de regra explícita para `confirmed`, se definida).
* Validar `amount` como valor numérico maior que zero.
* Persistir `createdAt` e `updatedAt` automaticamente.
* Resposta de sucesso retorna `201` com transação criada.
* Erros retornam contrato `{ error, message, statusCode }`.


Implementar criação de lançamento de receita


**Descrição**
Implementar criação de transação de receita com endpoint protegido e validações de negócio.

**Critérios de aceite**

* Criar endpoint protegido `POST /api/transactions/income` (sessão Better Auth obrigatória).
* `type` deve ser fixado como `income` pela regra do endpoint.
* Payload mínimo: `amount`, `transactionDate`; campos opcionais: `dueDate`, `orderId`, `clientId`, `category`, `paymentMethod`, `reference`, `notes`.
* Resolver `profileId` a partir da sessão; não aceitar `profileId` no payload.
* Status inicial padrão: `pending` (com possibilidade de regra explícita para `confirmed`, se definida).
* Validar `amount` como valor numérico maior que zero.
* Persistir `createdAt` e `updatedAt` automaticamente.
* Resposta de sucesso retorna `201` com transação criada.
* Erros retornam contrato `{ error, message, statusCode }`.


Criar schema e índices da collection lancamentos


**Descrição**
Implementar o data model da collection `transactions` para receitas e custos, com derivação de status de exibição `overdue`.

**Critérios de aceite**

* Criar collection `transactions` com campos: `profileId`, `type`, `status`, `amount`, `transactionDate`, `dueDate`, `orderId`, `clientId`, `category`, `paymentMethod`, `reference`, `notes`, `createdAt`, `updatedAt`.
* `type` deve aceitar apenas `income` ou `expense`.
* `status` persistido deve aceitar apenas `pending` ou `confirmed`.
* `paymentMethod` deve ser enum técnico em inglês (`pix`, `cash`, `creditCard`, `debitCard`, `bankTransfer`, `bankSlip`, `onCredit`).
* `overdue` não deve ser persistido em banco; deve ser derivado em leitura:
  * `displayStatus = overdue` quando `status === pending` e `dueDate < today`.
* Criar índices mínimos:
  * `{ profileId: 1 }`
  * `{ profileId: 1, type: 1 }`
  * `{ profileId: 1, status: 1 }`
  * `{ profileId: 1, orderId: 1 }`
  * `{ profileId: 1, dueDate: 1 }`
* Não armazenar `authUserId` nesta collection; vínculo de domínio deve ser por `profileId`.

Expor endpoints de documentos comerciais


**Descrição**
Expor endpoints para consumo dos serviços de documentos comerciais em rotas `/api/documents/*`.

**Critérios de aceite**

* Criar endpoint protegido `GET /api/documents/budget/:orderId`.
* Criar endpoint protegido `GET /api/documents/service-order/:orderId`.
* Criar endpoint protegido `GET /api/documents/receipt/:transactionId`.
* Endpoints devem resolver `profileId` da sessão Better Auth e aplicar escopo em todas as buscas.
* Respostas devem retornar payload JSON montado pelos serviços de documentos (sem obrigatoriedade de PDF nesta etapa).
* Recurso fora do escopo ou inexistente deve retornar `404`.
* Erros devem seguir contrato `{ error, message, statusCode }`.
* Cobrir rotas com testes automatizados de integração.


Implementar listagem, busca e filtros de lançamentos


**Descrição**
Implementar listagem de transações com paginação, busca, filtros e status derivado para exibição.

**Critérios de aceite**

* Criar endpoint protegido `GET /api/transactions`.
* Suportar paginação com `page` e `limit`.
* Suportar busca por `q` em `reference`, `category` e `notes`.
* Suportar filtros por `type`, `status`, `paymentMethod`, `orderId`, `clientId`, `dueFrom`, `dueTo`, `transactionFrom`, `transactionTo`.
* Filtro por `status` deve aceitar `overdue` como derivação de leitura (sem persistência em banco).
* Retornar somente transações do `profileId` autenticado.
* Resposta retorna `200` com shape `{ data, total, page, limit }` e campo `displayStatus` em cada item.
* Erros retornam contrato `{ error, message, statusCode }`.
