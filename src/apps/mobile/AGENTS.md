# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Contexto Atual

- App Expo SDK 56 com autenticação oficial Better Auth + plugin Expo.
- App Expo SDK 56 com suporte de web ativo (`react-native-web`) e alinhamento de versão entre `react` e `react-dom`.
- Plugin Expo do Better Auth é aplicado apenas em native (`ios`/`android`); no web o cliente roda sem plugin para evitar chamadas de SecureStore inexistentes no browser.
- Sessão autenticada armazenada em `expo-secure-store` e propagada para chamadas da API via cookie manual (`authClient.getCookie()`).
- Navegação com auth guard:
  - Sem sessão: `Login` / `SignUp`.
  - Com sessão: tabs e módulos autenticados.
- Módulo `Configurações` implementado com:
  - Edição de nome do usuário.
  - Edição de dados do negócio e endereço comercial.
  - Alteração de senha autenticada.
  - Logout explícito.

## Configuração de Ambiente

- Definir `EXPO_PUBLIC_API_URL` para apontar para a API alvo.
- Fallback local padrão por plataforma:
  - Web/iOS: `http://localhost:3001`.
  - Android Emulator: `http://10.0.2.2:3001`.
- Scheme do app: `meupj`.
