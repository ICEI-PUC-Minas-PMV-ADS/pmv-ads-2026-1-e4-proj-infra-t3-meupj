# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Contexto Atual

- App Expo SDK 56 com autenticação oficial Better Auth + plugin Expo.
- App Expo SDK 56 com suporte de web ativo (`react-native-web`) e alinhamento de versão entre `react` e `react-dom`.
- Plugin Expo do Better Auth é aplicado apenas em native (`ios`/`android`); no web o cliente roda sem plugin para evitar chamadas de SecureStore inexistentes no browser.
- Sessão autenticada armazenada em `expo-secure-store` e propagada para chamadas da API via cookie manual (`authClient.getCookie()`).
- A documentação humana do app fica em `README.md` neste diretório.

## Configuração de Ambiente

- `EXPO_PUBLIC_API_URL_WEB` sobrescreve a API usada no browser.
- `EXPO_PUBLIC_API_URL_NATIVE` sobrescreve a API usada em `ios`/`android`.
- `EXPO_PUBLIC_API_URL` continua como fallback genérico para native e ambientes não-locais.
- Fallback local padrão por plataforma:
  - Web em `localhost`/`127.0.0.1`: `http://localhost:3001`.
  - iOS local: `http://localhost:3001`.
  - Android Emulator: `http://10.0.2.2:3001`.
- Scheme do app: `meupj`.
