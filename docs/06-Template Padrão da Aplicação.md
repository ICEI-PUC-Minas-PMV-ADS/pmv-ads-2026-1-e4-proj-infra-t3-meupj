# Template Padrão da Aplicação

Layout padrão das aplicações web e mobile utilizado em todas as páginas do sistema, com definição de identidade visual, responsividade e iconografia.


## Identidade Visual

A identidade visual do sistema foi definida com foco em profissionalismo, contraste e legibilidade, garantindo boa experiência tanto em desktop quanto em dispositivos móveis.

### Paleta de Cores

As cores principais utilizadas no sistema são:

- **#fbfffa** → Cor de fundo principal 
- **rgb(44,44,44)** → Texto principal 
- **rgb(71,71,71)** → Textos secundários e labels
- **rgb(220,220,220)** → Bordas e divisões de layout
- **rgb(47,114,73)** → Cor de destaque para ações positivas (sucesso, confirmação)
- **rgb(105,99,207)** → Cor de destaque para ações principais (botões, links)

### Aplicação das Cores

- Fundo claro (#fbfffa) para reduzir fadiga visual  
- Textos escuros para garantir legibilidade  
- Elementos interativos destacados em roxo (ação principal)  
- Feedback visual:
- Verde → sucesso / confirmação  
- Roxo → ação primária  
- Cinza → elementos neutros  

### Tipografia

- Fonte simples e legível
- Priorização de leitura rápida em telas pequenas
- Hierarquia visual com tamanhos diferentes para títulos, subtítulos e conteúdo

### Iconografia

- Uso de ícones simples e intuitivos
- Ícones utilizados para representar ações:
  - ➕ Adicionar
  - ✏️ Editar
  - 🗑️ Excluir
  - 🔍 Buscar
- Objetivo: facilitar reconhecimento rápido das ações

---

## Layout Padrão

O sistema segue um padrão consistente em todas as telas.

### Estrutura Web

- Cabeçalho superior com identificação do sistema
- Área principal de conteúdo centralizada
- Componentes organizados em:
  - Cards
  - Listas
  - Formulários
- Navegação simples e direta entre módulos

### Estrutura Mobile

- Layout vertical adaptado
- Botão flutuante (+) para ações principais
- Menos elementos visuais para evitar poluição
- Navegação simplificada

## Responsividade

A aplicação foi projetada para funcionar em diferentes dispositivos.

### Desktop
- Uso de múltiplas colunas
- Melhor aproveitamento de espaço
- Visualização simultânea de informações

### Mobile
- Layout em coluna única
- Elementos maiores para toque
- Redução de campos visíveis inicialmente

---

## Wireframes

### 1. Autenticação (Login, Cadastro e Recuperação de Senha)

#### Objetivo
Permitir que o usuário acesse o sistema de forma segura e crie sua conta.

#### Funcionalidades
- Login com e-mail e senha  
- Cadastro de novo usuário  
- Recuperação de senha  

#### Requisitos atendidos
- RF-001  
- RF-002  
- RF-003  
- RNF-001  
- RNF-002  

#### Decisões de design
- Layout dividido com área visual e formulário  
- Campos simples e diretos  
- Botões de ação destacados  
- Versão mobile otimizada para uso rápido  

#### Relação com personas
- João: acesso rápido  
- Carla: experiência profissional  
- Marcos: facilidade para múltiplos acessos  

![Login e Cadastro](./img/login_cadastro.jpeg)

---

### 2. Catálogo (Produtos e Serviços)

#### Objetivo
Gerenciar os itens oferecidos pelo usuário.

#### Funcionalidades
- Listagem em cards  
- Filtro por tipo (produto/serviço)  
- Cadastro e edição de itens  
- Definição de preço e unidade  

#### Requisitos atendidos
- RF-012  
- RF-013  
- RF-014  
- RF-015  

#### Decisões de design
- Uso de cards para melhor visualização  
- Separação por abas (Todos, Produtos, Serviços)  
- Destaque para preço  

#### Diferencial
- Campo de custo e margem para produtos  

#### Relação com personas
- João: visão rápida  
- Carla: padronização  
- Marcos: controle facilitado  

![Catalogo](./img/catalogo.jpeg)

---

### 3. Financeiro

#### Objetivo
Apresentar a situação financeira do negócio de forma clara e centralizada.

#### Funcionalidades
- Painel com indicadores:
  - Receita confirmada  
  - Valores a receber  
  - Valores em atraso  
  - Resultado  
- Lista de lançamentos  
- Cadastro de receitas e custos  

#### Requisitos atendidos
- RF-016  
- RF-017  
- RF-018  

#### Decisões de design
- Uso de cores para status  
- Gráfico simplificado  
- Lista com informações resumidas  

#### Relação com personas
- João: controle básico  
- Carla: visão estratégica  
- Marcos: acompanhamento financeiro  

---

### 4. Lista de Clientes

![Lista de Clientes](./img/lista_clientes.jpeg)

#### Objetivo
Permitir a visualização e gerenciamento dos clientes cadastrados.

#### Funcionalidades
- Listagem de clientes  
- Busca por nome  
- Identificação por tipo (PF/PJ)  
- CRUD completo  

#### Decisões de Design
- Separação por seções  
- Lista simples e objetiva  
- Campos diretos  

#### Requisitos atendidos
- RF-004  
- RF-005  
- RF-006  
- RF-007  

---

### 5. Perfil do Usuário ("Meu Perfil")

![Perfil](./img/perfil.jpeg)

#### Objetivo
Permitir a gestão dos dados pessoais e do negócio.

#### Funcionalidades
- Edição de dados pessoais  
- Atualização do negócio  
- Upload de logotipo  
- Personalização de documentos  

#### Estrutura
- Dados do usuário  
- Dados do negócio  
- Contato  
- Endereço  
- Rodapé  

#### Decisões de Design
- Centralização das informações  
- Organização por seções  
- Facilidade de edição  

#### Requisitos atendidos
- RF-001  
- RF-002  
- RNF-003  

---

## Versão Mobile

A versão mobile foi projetada com foco em praticidade.

### Características
- Layout vertical  
- Botão flutuante (+)  
- Navegação simplificada  
- Elementos adaptados para toque  

#### Requisitos atendidos
- RNF-004  

---

## Justificativa de Design

O projeto foi baseado em três pilares principais:

### Simplicidade
- Interfaces limpas  
- Navegação direta  

### Eficiência
- Redução de cliques  
- Ações principais visíveis  

### Clareza
- Uso de cores para status  
- Organização por módulos  
- Hierarquia visual bem definida  
