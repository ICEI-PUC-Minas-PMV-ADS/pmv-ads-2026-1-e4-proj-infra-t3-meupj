# Testes Unitários no Backend

## O que são Testes Unitários?

Testes unitários são testes automatizados executados para validar partes específicas do código de forma isolada, como funções, regras de negócio, stores e comportamento de rotas sob dependências controladas.

## Por que são Importantes?

Testes unitários ajudam a:

- identificar problemas mais cedo no ciclo de desenvolvimento;
- evitar regressões após alterações;
- dar segurança para refatorações;
- validar regras de negócio críticas do sistema.

## Configuração do Ambiente

Este projeto utiliza Node.js, `pnpm` e Vitest para os testes automatizados do backend.

1. **Instalar dependências do monorepo**

   ```bash
   cd src
   pnpm install
   ```

2. **Executar os testes do backend**

   ```bash
   pnpm --filter @repo/api test
   ```

3. **Executar a suíte completa do monorepo**

   ```bash
   pnpm test
   ```

## App / Profile

### Arquivo de Teste

- `src/apps/api/src/__tests__/app.test.ts`

### Cobertura Registrada

Os testes de `app` e `profile` cobrem:

1. **Bootstrap da aplicação**

- criação da aplicação com dependências injetadas;
- carregamento dos módulos principais;
- resposta do healthcheck e estruturas básicas da API.

2. **GET /api/profile**

- retorno `401` sem sessão;
- recuperação do perfil do usuário autenticado;
- criação automática do perfil quando necessário;
- serialização correta dos dados retornados.

3. **PUT /api/profile**

- retorno `401` sem autenticação;
- atualização dos dados do negócio;
- persistência de `updatedAt`;
- validação do payload segundo o schema definido.

## Catalog

### Arquivo de Teste

- `src/apps/api/src/__tests__/catalog.test.ts`

### Cobertura Registrada

Os testes de `catalog` cobrem:

1. **Store do catálogo**

- criação dos índices esperados;
- garantia de que índices não sejam recriados indevidamente;
- obtenção correta da collection vinculada ao banco.

2. **GET /api/catalog**

- retorno `401` sem sessão;
- paginação padrão e paginação via query string;
- filtros por tipo;
- busca textual;
- ordenação e serialização dos dados.

3. **POST /api/catalog**

- criação com sucesso para payload válido;
- inclusão condicional de campos opcionais;
- validação de payload inválido com retorno `400`.

4. **PUT /api/catalog/:itemId**

- atualização parcial do item;
- retorno `404` para item inexistente;
- validação de corpo vazio e identificador inválido.

5. **DELETE /api/catalog/:itemId**

- exclusão com sucesso quando elegível;
- retorno `404` para item inexistente;
- proteção contra formato inválido de identificador.

## Clients

### Arquivo de Teste

- `src/apps/api/src/__tests__/clients.test.ts`

### Cobertura Registrada

Os testes de `clients` cobrem:

1. **Store de clientes**

- criação de índices por `profileId`, `name`, `document` e `email`;
- remoção de índice legado incompatível quando presente;
- retorno consistente da collection.

2. **GET /api/clients**

- retorno `401` sem autenticação;
- respostas paginadas;
- busca textual;
- isolamento dos dados por perfil autenticado.

3. **POST /api/clients**

- criação de cliente do tipo `individual` e `company`;
- validação de documento inválido;
- proteção por autenticação.

4. **PUT /api/clients/:clientId**

- atualização de campos variados;
- retorno `400` para dados inválidos;
- retorno `404` para cliente inexistente.

5. **DELETE /api/clients/:clientId**

- exclusão com retorno `204` quando elegível;
- bloqueio com `409` quando houver vínculo impeditivo;
- proteção contra exclusão fora do escopo do perfil.

## Orders

### Arquivos de Teste

- `src/apps/api/src/__tests__/orders.test.ts`
- `src/apps/api/src/__tests__/orders-rules.test.ts`

### Cobertura Registrada

Os testes de `orders` cobrem:

1. **Store e regras do módulo**

- criação dos índices esperados para pedidos;
- geração e persistência de pedidos por perfil;
- validação das transições de status permitidas.

2. **GET /api/orders**

- retorno `401` sem autenticação;
- paginação, filtros e ordenação;
- retorno de `clientName` quando houver vínculo com cliente;
- serialização correta de datas e totais.

3. **GET /api/orders/:orderId**

- leitura de pedido por id no escopo do perfil;
- retorno `404` para pedido inexistente.

4. **POST /api/orders**

- criação de pedido com itens de catálogo;
- cálculo de subtotal, desconto, taxas e total;
- validação de payload e de relações com catálogo/cliente.

5. **PUT /api/orders/:orderId**

- atualização do pedido;
- alteração de status respeitando as regras do domínio;
- retorno apropriado para inconsistências e falta de escopo.

6. **DELETE /api/orders/:orderId**

- exclusão quando não há impedimento;
- bloqueio quando existem lançamentos confirmados associados.

## Transactions

### Arquivo de Teste

- `src/apps/api/src/__tests__/transactions.test.ts`

### Cobertura Registrada

Os testes de `transactions` cobrem:

1. **Store de lançamentos**

- criação dos índices esperados;
- segmentação por `profileId`, `type`, `status`, `orderId` e `clientId`.

2. **Rotas de criação**

- criação de receitas e custos;
- validação de payload;
- proteção por autenticação.

3. **Listagem e leitura**

- retorno `401` sem sessão;
- filtros por tipo, status, datas e vínculos;
- cálculo do `displayStatus`, incluindo atraso.

4. **Atualização e exclusão**

- edição de lançamento existente;
- retorno `404` para registro inexistente;
- bloqueio de exclusão para lançamento confirmado.

## Documents

### Arquivo de Teste

- `src/apps/api/src/__tests__/documents.test.ts`

### Cobertura Registrada

Os testes de `documents` cobrem:

1. **Builders de documento**

- montagem dos dados de orçamento, ordem de serviço e recibo;
- serialização dos blocos de perfil, cliente, pedido e lançamento.

2. **Rotas JSON de documentos**

- retorno `401` sem autenticação;
- retorno `404` para pedido ou lançamento inexistente;
- retorno `409` para status incompatível com a emissão.

3. **Rotas PDF**

- geração de `application/pdf`;
- emissão de orçamento para pedido elegível;
- emissão de ordem de serviço para pedido elegível;
- emissão de recibo para lançamento confirmado;
- conteúdo não vazio e cabeçalhos apropriados da resposta.

## Observações

- Os testes utilizam mocks e dependências controladas para isolar autenticação, stores e persistência quando necessário.
- As suítes registradas aqui representam os arquivos de teste presentes no repositório no estado atual da implementação.
