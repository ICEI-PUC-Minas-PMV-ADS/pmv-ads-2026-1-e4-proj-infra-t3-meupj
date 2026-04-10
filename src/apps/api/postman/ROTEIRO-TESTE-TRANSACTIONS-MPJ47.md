# Roteiro de Teste Manual (Postman)

## 1. Preparacao

1. Inicie a API localmente em `src/apps/api`:
   - `pnpm dev`
2. No Postman, importe os arquivos:
   - `transactions-mpj47.postman_collection.json`
   - `transactions-mpj47.local.postman_environment.json`
3. Selecione o environment `MeuPJ API Local`.

## 2. Ordem de Execucao Recomendada

1. `00 - Health / Health Check`
2. `01 - Auth / Sign Up (optional)`
3. `01 - Auth / Sign In`
4. `01 - Auth / Profile (authenticated)`
5. `02 - Transactions / Create Income`
6. `02 - Transactions / Create Expense`
7. `02 - Transactions / List Transactions`
8. `02 - Transactions / Update Income`
9. `02 - Transactions / Confirm Expense`
10. `02 - Transactions / Confirm Expense Again (idempotent)`
11. `02 - Transactions / Delete Confirmed Expense (must fail 409)`
12. `02 - Transactions / Delete Income (must pass 204)`
13. `02 - Transactions / Confirm Missing Transaction (must fail 404)`

## 3. O que validar em cada etapa

- Sign In deve salvar `sessionCookie` no environment automaticamente.
- Create Income deve salvar `incomeTransactionId`.
- Create Expense deve salvar `expenseTransactionId`.
- Confirm Expense Again deve continuar retornando 200 (idempotencia).
- Delete Confirmed Expense deve retornar 409.
- Delete Income deve retornar 204.
- Confirm Missing Transaction deve retornar 404.

## 4. Observacoes

- Se o usuario ja existir, `Sign Up (optional)` pode retornar 409 e isso e esperado.
- Se `sessionCookie` nao for preenchido apos o login, confirme:
  - `baseUrl` correto
  - resposta de `Sign In` com `set-cookie`
  - `BETTER_AUTH_URL` e `CORS_ORIGIN` coerentes com a URL da API
