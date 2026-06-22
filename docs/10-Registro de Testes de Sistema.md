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

<video src="../videos/edição-perfil-desk.mp4" width="600" controls></video>

#### Evidências - Mobile

<video src="../videos/edicao-perfil-mob.mp4" height="500" controls></video>

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

<video src="../videos/edicao-cliente-desk.mp4" width="600" controls></video>

#### Evidências - Mobile

<video src="../videos/edicao-cliente-mob.mp4" height="500" controls></video>

### RF 006 - O sistema deve permitir que o usuário exclua um cliente, respeitando as validações de vínculo do sistema

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de clientes
3. Solicitação de exclusão de cliente elegível
4. Validação do modal de confirmação e do resultado da operação

#### Evidências - Web

<video src="../videos/delecao-cliente-desk.mp4" width="600" controls></video>

#### Evidências - Mobile

<video src="../videos/delecao-cliente-mob.mp4" height="500" controls></video>

### RF 007 - O sistema deve permitir que o usuário busque e filtre clientes cadastrados

#### Descrição dos testes

1. Login no sistema
2. Acesso à tela de clientes
3. Busca por texto e troca de filtro por tipo
4. Conferência da listagem filtrada

#### Evidências - Web

<img width="600" alt="image" src="https://github.com/user-attachments/assets/f5b61123-04c4-4cd6-a17f-2dc6ac90352e" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/411c47c7-6dc6-4ea5-a825-147113ca5646" />

#### Evidências - Mobile

<img height="500" alt="image" src="https://github.com/user-attachments/assets/97e35e8b-c0ab-4f3b-8e10-eaa6fbb225d0" />
<img height="500" alt="image" src="https://github.com/user-attachments/assets/9f5cbede-682a-49be-9bf0-3837ccfc8f38" />

### RF 008 - O sistema deve permitir que o usuário crie pedidos com um ou mais itens de catálogo, cliente opcional e condições comerciais

#### Descrição dos testes

1. Login no sistema
2. Acesso ao fluxo de novo pedido
3. Seleção de itens do catálogo e preenchimento das condições comerciais
4. Salvamento do pedido e conferência na listagem

#### Evidências - Web

<video src="https://github.com/user-attachments/assets/1ed2649f-f484-4c22-855d-4e4529e3a238" width="600"></video>

#### Evidências - Mobile

https://github.com/user-attachments/assets/ee31d2fb-6872-4000-aff6-9a7ef8f35f80


### RF 009 - O sistema deve permitir que o usuário edite pedidos, incluindo status válidos e composição dos itens

#### Descrição dos testes

1. Login no sistema
2. Acesso ao detalhe ou edição de pedido existente
3. Alteração de status e dados do pedido
4. Salvamento e conferência do retorno atualizado

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

https://github.com/user-attachments/assets/3dbe98f1-c568-432d-a753-cc281c3a810a

### RF 010 - O sistema deve permitir que o usuário exclua pedidos quando não houver impedimento pelas regras do negócio

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem ou detalhe do pedido
3. Solicitação de exclusão de pedido elegível
4. Validação do comportamento esperado após confirmação

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

https://github.com/user-attachments/assets/1c2b0215-5bc4-4c6b-b51e-1f67f2fc67e2

### RF 011 - O sistema deve permitir que o usuário busque e filtre pedidos por texto, cliente e status

#### Descrição dos testes

1. Login no sistema
2. Acesso à listagem de pedidos
3. Aplicação de busca e filtros
4. Conferência do resultado na interface

#### Evidências - Web

https://github.com/user-attachments/assets/51dacbd0-d68f-4290-a695-77978db0d038

#### Evidências - Mobile

https://github.com/user-attachments/assets/907dd767-43c9-42fe-8598-e4834248c234

### RF 012 - O sistema deve permitir que o usuário cadastre serviços e produtos no catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao módulo de catálogo
3. Criação de novo item
4. Conferência do item na listagem

#### Evidências - Web

https://github.com/user-attachments/assets/3685b74e-f29f-429d-b0d6-35937a4a9e10

#### Evidências - Mobile

https://github.com/user-attachments/assets/9761bc3b-145b-46f8-8a31-c1676d3e9c1b

### RF 013 - O sistema deve permitir que o usuário edite os dados de um item do catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao item cadastrado
3. Edição dos dados permitidos
4. Salvamento e conferência da atualização

#### Evidências - Web

Evidência pendente de atualização.

#### Evidências - Mobile

https://github.com/user-attachments/assets/6f4a4c22-d7ea-4724-a1e9-feaa7535de77

### RF 014 - O sistema deve permitir que o usuário exclua um item de catálogo, respeitando os vínculos existentes

#### Descrição dos testes

1. Login no sistema
2. Acesso ao catálogo
3. Solicitação de exclusão de item elegível ou vinculado
4. Validação do sucesso ou do bloqueio conforme a regra

#### Evidências - Web

https://github.com/user-attachments/assets/82b67a19-33b2-4194-8948-8a22269e678c

#### Evidências - Mobile

https://github.com/user-attachments/assets/3628a747-42bb-4a0c-b254-dbdb2b17bc89

### RF 015 - O sistema deve permitir que o usuário busque e filtre itens do catálogo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao catálogo
3. Aplicação de busca e filtros
4. Conferência da listagem resultante

#### Evidências - Web

https://github.com/user-attachments/assets/7a56e824-83dd-495f-8091-e1fee51bb9ef

#### Evidências - Mobile

https://github.com/user-attachments/assets/1ad77f4c-0bf7-41ed-a2fd-f9a8f4c0c2d7


### RF 016 - O sistema deve permitir que o usuário registre lançamentos financeiros de receita e custo

#### Descrição dos testes

1. Login no sistema
2. Acesso ao fluxo de novo lançamento
3. Registro de receita e de custo com dados válidos
4. Conferência da atualização do dashboard

#### Evidências - Web

Figura 01 - Criando lançamento
<img width="1246" height="630" alt="image" src="https://github.com/user-attachments/assets/82be1789-19df-412a-8189-4d4ad2532ed5" />

Figura 02 - Lançamento criado

<img width="1254" height="252" alt="image" src="https://github.com/user-attachments/assets/e955351d-d827-437f-a9b6-889f9ddded87" />

#### Evidências - Mobile

Figura 03 - Criando lançamento
<img width="371" height="573" alt="image" src="https://github.com/user-attachments/assets/9bf63407-bc08-4e41-9d85-834be8f51c7f" />


Figura 04 - Lançamento criado
<img width="275" height="565" alt="image" src="https://github.com/user-attachments/assets/35df0b64-75b3-4653-99d1-920dcf54eb6d" />

### RF 017 - O sistema deve permitir que o usuário edite lançamentos financeiros e aplique as restrições de exclusão previstas

#### Descrição dos testes

1. Login no sistema
2. Acesso ao lançamento existente
3. Edição dos dados e tentativa de exclusão em cenários distintos
4. Validação do bloqueio para registros confirmados

#### Evidências - Web

Figura 01 - Editando um lançamento Web

<img width="1204" height="555" alt="image" src="https://github.com/user-attachments/assets/aa133bd8-f8bc-42e7-a6ab-f8508768a011" />


#### Evidências - Mobile

Figura 02 - Editando um lançamento mobile+

<img width="278" height="570" alt="image" src="https://github.com/user-attachments/assets/f55d505a-03b1-4004-a8d6-373099e23bfd" />


### RF 018 - O sistema deve exibir um painel financeiro com resumos de receita confirmada, valores pendentes, atrasos, resultado e listagem recente

#### Descrição dos testes

1. Login no sistema
2. Acesso ao dashboard financeiro
3. Conferência dos indicadores principais
4. Conferência da listagem recente e filtros de período

#### Evidências - Web

Figura 01 - Dashboard

<img width="1257" height="599" alt="image" src="https://github.com/user-attachments/assets/67113f13-b6b0-4c1f-a4ff-72bf5069356e" />


#### Evidências - Mobile

Figura 02 - Dashboard mobile

<img width="286" height="572" alt="image" src="https://github.com/user-attachments/assets/9e5a353a-e86c-4ffe-81cb-78574f1021ef" />


### RF 019 - O sistema deve permitir gerar um recibo em PDF a partir de um lançamento confirmado

#### Descrição dos testes

1. Login no sistema
2. Acesso ao lançamento confirmado elegível
3. Acionamento da emissão do recibo
4. Conferência da abertura do documento na plataforma correspondente

#### Evidências - Web

<video src="../videos/recibo-web.mp4" height="500" controls></video>

#### Evidências - Mobile

<video src="../videos/recibo-mob.mp4" height="500" controls></video>

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
