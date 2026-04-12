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

## Observações

- Os testes são executados com mocks/stubs de dependências (autenticação, profile store e acesso a banco), garantindo isolamento da unidade testada.
