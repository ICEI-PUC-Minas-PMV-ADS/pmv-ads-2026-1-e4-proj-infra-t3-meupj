# Mobile

Aplicação mobile do projeto em Expo, com suporte web para desenvolvimento e smoke de interface.

## Stack

- Expo SDK 56
- React Native
- React Navigation
- Better Auth Expo

## Módulos Atuais

- login
- cadastro
- dashboard
- clientes
- catálogo
- pedidos
- configurações

## Funcionalidades Implementadas

- autenticação com guarda de sessão
- sessão propagada para a API via cookie manual no native
- CRUD principal de clientes
- CRUD principal de catálogo
- CRUD principal de pedidos
- criação de lançamentos
- edição de configurações do usuário e do negócio
- contato rápido por telefone e WhatsApp na lista de clientes
- emissão de orçamento, ordem de serviço e recibo a partir das listas

## Diferenças Entre Web e Native

- no web, os PDFs são abertos pela URL autenticada da API
- no native, os PDFs são baixados e entregues ao compartilhamento/abertura externa
- no web local em `localhost`, a API cai automaticamente para `http://localhost:3001`
- no Android emulator, o fallback local continua sendo `http://10.0.2.2:3001`

## Execução Local

Instalar dependências na raiz:

```bash
pnpm install
```

Rodar Expo:

```bash
pnpm --filter mobile start
pnpm --filter mobile web
pnpm --filter mobile android
pnpm --filter mobile ios
```

Smoke de build web:

```bash
pnpm --filter mobile exec expo export --platform web
```

## Ambiente

Variáveis suportadas:

- `EXPO_PUBLIC_API_URL_WEB`
- `EXPO_PUBLIC_API_URL_NATIVE`
- `EXPO_PUBLIC_API_URL`

Comportamento atual:

- `EXPO_PUBLIC_API_URL_WEB` sobrescreve apenas o browser
- `EXPO_PUBLIC_API_URL_NATIVE` sobrescreve apenas `ios` e `android`
- `EXPO_PUBLIC_API_URL` funciona como fallback genérico

Fallbacks locais:

- web em `localhost` ou `127.0.0.1`: `http://localhost:3001`
- iOS local: `http://localhost:3001`
- Android emulator: `http://10.0.2.2:3001`

## Navegação

Tabs autenticadas:

- Dashboard
- Clientes
- Catálogo
- Pedidos
- Configurações

Rotas adicionais autenticadas:

- novo lançamento
- resumo por categoria
- novo pedido
- detalhe de pedido
- novo cliente
- detalhe de cliente
- novo item
- detalhe de item
