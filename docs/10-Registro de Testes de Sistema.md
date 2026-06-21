# Registros de Teste de Sistema

## Requisitos Funcionais

### RF 001 - O sistema deve permitir que o usuário crie uma conta com nome, email e senha, gerando sessão autenticada após o cadastro

#### Descrição dos testes

1. Acesso à tela de cadastro
2. Preenchimento do formulário com dados válidos
3. Confirmação do cadastro
4. Verificação de acesso à área autenticada

#### Evidências - Web
<img width="600" alt="image" src="https://github.com/user-attachments/assets/f87ccfe2-639a-4350-9547-483dbc35869b" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/47076d4a-fdd4-4340-9480-99dcd7b751f7" />

#### Evidências - Mobile
<img height="500" alt="image" src="https://github.com/user-attachments/assets/6ec394ce-e95a-456f-abf2-4b6efe061a82" />
<img height="500" alt="image" src="https://github.com/user-attachments/assets/cf0775ad-8ed3-43c6-9630-9741088506a6" />

### RF 002 - O sistema deve permitir que o usuário realize login e mantenha sessão autenticada para uso das áreas protegidas

#### Descrição dos testes

1. Acesso à tela de login
2. Preenchimento das credenciais válidas
3. Entrada na área autenticada
4. Validação de persistência da sessão

#### Evidências - Web
<img width="600" alt="image" src="https://github.com/user-attachments/assets/11c7d7a6-5004-422c-b5d2-a08cd4c4dfcb" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/fb93b3bd-2b8c-4223-a4ca-3f53e493e419" />

#### Evidências - Mobile
<img height="500" alt="image" src="https://github.com/user-attachments/assets/1aacdb0a-4bf8-40ab-acda-5232f70f31d3" />
<img height="500" alt="image" src="https://github.com/user-attachments/assets/651c2f4b-7bc2-42ab-8717-7073f566defb" />


### RF 003 - O sistema deve permitir que o usuário visualize e edite os dados do perfil do negócio em configurações

#### Descrição dos testes

1. Login no sistema
2. Acesso à tela de configurações
3. Alteração de dados do negócio
4. Salvamento e conferência do retorno atualizado

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 004 - O sistema deve permitir que o usuário cadastre clientes com nome, tipo, documento, telefone, email e endereço

#### Descrição dos testes

1. Login no sistema
2. Acesso à tela de clientes
3. Criação de novo cliente com dados válidos
4. Conferência do cliente na listagem

#### Evidências - Web

<img width="600" alt="image" src="https://github.com/user-attachments/assets/ba61e36e-f620-4e1c-9ee2-342a00e47593" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/4259903a-7e11-466e-8dd9-9a303f7e2283" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/f5b61123-04c4-4cd6-a17f-2dc6ac90352e" />

#### Evidências - Mobile

<img height="500" alt="image" src="https://github.com/user-attachments/assets/7945141d-9544-4ccb-ad1f-dd6d1f1e998c" />
<img height="500" alt="image" src="https://github.com/user-attachments/assets/3c99b652-ed96-4d68-a4a0-e0ce3e287e79" />
<img height="500" alt="image" src="https://github.com/user-attachments/assets/97e35e8b-c0ab-4f3b-8e10-eaa6fbb225d0" />

### RF 005 - O sistema deve permitir que o usuário edite os dados de um cliente

#### Descrição dos testes

1. Login no sistema
2. Acesso ao cliente cadastrado
3. Edição dos campos permitidos
4. Conferência do retorno atualizado

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 006 - O sistema deve permitir que o usuário exclua um cliente, respeitando as validações de vínculo do sistema

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de clientes
3. Solicitação de exclusão de cliente elegível
4. Validação do modal de confirmação e do resultado da operação

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 007 - O sistema deve permitir que o usuário busque e filtre clientes cadastrados

#### Descrição dos testes

1. Login no sistema
2. Acesso à tela de clientes
3. Busca por texto e troca de filtro por tipo
4. Conferência da listagem filtrada

#### Evidências - Web

<img width="2940" height="1770" alt="image" src="https://github.com/user-attachments/assets/f5b61123-04c4-4cd6-a17f-2dc6ac90352e" />
<img width="2940" height="1750" alt="image" src="https://github.com/user-attachments/assets/411c47c7-6dc6-4ea5-a825-147113ca5646" />

#### Evidências - Mobile

<img width="670" height="1464" alt="image" src="https://github.com/user-attachments/assets/97e35e8b-c0ab-4f3b-8e10-eaa6fbb225d0" />
<img width="668" height="1474" alt="image" src="https://github.com/user-attachments/assets/9f5cbede-682a-49be-9bf0-3837ccfc8f38" />

### RF 008 - O sistema deve permitir que o usuário crie pedidos com um ou mais itens de catálogo, cliente opcional e condições comerciais

#### Descrição dos testes

1. Login no sistema
2. Acesso ao fluxo de novo pedido
3. Seleção de itens do catálogo e preenchimento das condições comerciais
4. Salvamento do pedido e conferência na listagem

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 009 - O sistema deve permitir que o usuário edite pedidos, incluindo status válidos e composição dos itens

#### Descrição dos testes

1. Login no sistema
2. Acesso ao detalhe ou edição de pedido existente
3. Alteração de status e dados do pedido
4. Salvamento e conferência do retorno atualizado

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 010 - O sistema deve permitir que o usuário exclua pedidos quando não houver impedimento pelas regras do negócio

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem ou detalhe do pedido
3. Solicitação de exclusão de pedido elegível
4. Validação do comportamento esperado após confirmação

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 011 - O sistema deve permitir que o usuário busque e filtre pedidos por texto, cliente e status

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de pedidos
3. Aplicação de busca e filtros
4. Conferência do resultado na interface

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 012 - O sistema deve permitir que o usuário cadastre serviços e produtos no catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao módulo de catálogo
3. Criação de novo item
4. Conferência do item na listagem

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 013 - O sistema deve permitir que o usuário edite os dados de um item do catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao item cadastrado
3. Edição dos dados permitidos
4. Salvamento e conferência da atualização

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 014 - O sistema deve permitir que o usuário exclua um item de catálogo, respeitando os vínculos existentes

#### Descrição dos testes

1. Login no sistema
2. Acesso ao catálogo
3. Solicitação de exclusão de item elegível ou vinculado
4. Validação do sucesso ou do bloqueio conforme a regra

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 015 - O sistema deve permitir que o usuário busque e filtre itens do catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao catálogo
3. Aplicação de busca e filtros
4. Conferência da listagem resultante

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 016 - O sistema deve permitir que o usuário registre lançamentos financeiros de receita e custo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao fluxo de novo lançamento
3. Registro de receita e de custo com dados válidos
4. Conferência da atualização do dashboard

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 017 - O sistema deve permitir que o usuário edite lançamentos financeiros e aplique as restrições de exclusão previstas

#### Descrição dos testes

1. Login no sistema
2. Acesso ao lançamento existente
3. Edição dos dados e tentativa de exclusão em cenários distintos
4. Validação do bloqueio para registros confirmados

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 018 - O sistema deve exibir um painel financeiro com resumos de receita confirmada, valores pendentes, atrasos, resultado e listagem recente

#### Descrição dos testes

1. Login no sistema
2. Acesso ao dashboard financeiro
3. Conferência dos indicadores principais
4. Conferência da listagem recente e filtros de período

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 019 - O sistema deve permitir gerar um recibo em PDF a partir de um lançamento confirmado

#### Descrição dos testes

1. Login no sistema
2. Acesso ao lançamento confirmado elegível
3. Acionamento da emissão do recibo
4. Conferência da abertura do documento na plataforma correspondente

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 020 - O sistema deve permitir gerar um orçamento em PDF a partir de um pedido elegível

#### Descrição dos testes

1. Login no sistema
2. Acesso ao pedido elegível
3. Acionamento da emissão de orçamento
4. Conferência da abertura do PDF

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 021 - O sistema deve permitir gerar uma ordem de serviço em PDF a partir de um pedido elegível

#### Descrição dos testes

1. Login no sistema
2. Acesso ao pedido com status compatível
3. Acionamento da emissão da ordem de serviço
4. Conferência da abertura do PDF

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 022 - O sistema deve permitir que o usuário inicie uma chamada telefônica para um cliente com telefone válido

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de clientes
3. Abertura do menu de ações rápidas
4. Acionamento do link de telefone para cliente com número válido

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.

### RF 023 - O sistema deve permitir que o usuário abra uma conversa no WhatsApp para um cliente com telefone válido

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de clientes
3. Abertura do menu de ações rápidas
4. Acionamento do link do WhatsApp para cliente com número válido

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

Evidência pendente de atualização.
