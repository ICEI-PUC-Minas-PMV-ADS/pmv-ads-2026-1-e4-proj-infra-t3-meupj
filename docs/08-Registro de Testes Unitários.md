# Testes Unitários no Backend

## O que são Testes Unitários?

Testes unitários são testes automatizados escritos e executados para garantir que pequenas partes individuais do código (unidades) funcionem conforme esperado. No contexto do desenvolvimento backend, isso geralmente significa testar funções, métodos, ou classes de maneira isolada, sem dependências externas como bancos de dados ou serviços web.

## Por que são Importantes?

Testes unitários ajudam a:

- Identificar problemas de maneira precoce no ciclo de desenvolvimento.
- Garantir que o código continue funcionando após alterações (regressões).
- Facilitar o processo de refatoração.
- Melhorar a confiabilidade e a qualidade do software.

## Configuração do Ambiente

Este projeto utiliza Node.js, pnpm e Vitest para testes unitários no backend.

1. **Instalar dependências do workspace**

   ```bash
   pnpm install
   ```

2. **Acessar a aplicação de API**

   ```bash
   cd src/apps/api
   ```

3. **Comando de teste da API (referência)**

   ```bash
   pnpm test
   ```

4. **Comando para executar somente o arquivo de catálogo (referência)**

   ```bash
   pnpm test src/__tests__/catalog.test.ts
   ```

## Catalog

### Arquivo de Teste

- `src/apps/api/src/__tests__/catalog.test.ts`

### Cobertura Registrada

Os testes de catalog cobrem:

1. **Store do catálogo**
- Criação de índices esperados (`profileId`, `profileId + type`, `profileId + name`).
- Garantia de que índices não são recriados desnecessariamente na mesma instância de banco.
- Validação de retorno da collection e uso correto do `getDb` injetado.

2. **GET /api/catalog**
- Retorno `401` para requisição sem sessão.
- Paginação padrão e paginação via query string.
- Limites máximos de paginação (`page` e `limit`).
- Filtro por tipo (`product`/`service`).
- Busca textual em `name` e `description`.
- Ordenação padrão por data de criação.
- Isolamento de dados por `profileId` autenticado.
- Serialização de `_id` e datas para string.
- Presença condicional de campos opcionais (`description`, `costPrice`).

3. **POST /api/catalog**
- Retorno `401` sem autenticação.
- Criação com sucesso (`201`) para payload válido.
- Inclusão e omissão de campos opcionais.
- Validação de payload inválido (`type`, `unitPrice`, `unitMeasure`) com retorno `400`.

4. **PUT /api/catalog/:itemId**
- Retorno `401` sem autenticação.
- Retorno `404` para item inexistente no escopo do perfil.
- Atualização parcial de campos.
- Validação de corpo vazio (`400`).
- Validação de formato inválido de `itemId` (`400`).

5. **DELETE /api/catalog/:itemId**
- Retorno `401` sem autenticação.
- Retorno `404` para item inexistente.
- Exclusão com sucesso (`204`).
- Validação de formato inválido de `itemId` (`400`).

## Clients

### Arquivo de Teste

- `src/apps/api/src/__tests__/clients.test.ts`

### Cobertura Registrada

Os testes de clients cobrem:

1. **Store de clientes**
- Criação e validação dos índices esperados (`profileId`, `profileId + name`, acesso único no `documento` e `email`).
- Garantia de que os índices não sejam gerados repetidamente em sub-invocações no mesmo DB.
- Validação de retorno da função padrão `getCollection()`.

2. **GET /api/clients**
- Restrição global `401` sem a presença de uma sessão ativa autenticada.
- Respostas paginadas por padrão.
- Checagem funcional da listagem com termo de busca text-based em nomes, endereços de email ou identificadores usando `$regex`.

3. **POST /api/clients**
- Restrição global de autenticação com status de verificação `401`.
- Bloqueio com erro de BadRequest (`400`) se houver injeção de documentos incorretos (ex: CPF/CNPJ com formatação de repetição de caracteres).
- Submissão correta `201` para a criação lícita de indivíduos (tipo `individual`) e companhias comerciais (tipo `company`).

4. **PUT /api/clients/:clientId**
- Alterações em propriedades variadas de um cliente existente de forma bem-sucedida.
- Recusa com erro `400` para documentação sub-padrão no ato do update.
- Falha apropriada (`404`) quando a rota mira um objeto de id inexistente no escopo em questão.

5. **DELETE /api/clients/:clientId**
- Retorno correto (`204`) quando executa a limpeza sem problemas de um cliente válido.
- Segurança de dados com falha estrutural por `Conflict` (Erro `409`) quando interligado na tabela virtual temporária de *`orders`*.
- Erro relacional ao tentar deletar clientes inválidos.

## Observações

- Os testes são executados com mocks/stubs de dependências (autenticação, profile store e acesso a banco), garantindo isolamento da unidade testada.
