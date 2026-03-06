# Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="1-Documentação de Contexto.md"> Documentação de Contexto</a></span>

Definição do problema e ideia de solução a partir da perspectiva do usuário. É composta pela definição do diagrama de personas, histórias de usuários, requisitos funcionais e não funcionais além das restrições do projeto.

Apresente uma visão geral do que será abordado nesta parte do documento, enumerando as técnicas e/ou ferramentas utilizadas para realizar a especificações do projeto

## Personas

Pedro Paulo tem 26 anos, é arquiteto recém-formado e autônomo. Pensa em se desenvolver profissionalmente através de um mestrado fora do país, pois adora viajar, é solteiro e sempre quis fazer um intercâmbio. Está buscando uma agência que o ajude a encontrar universidades na Europa que aceitem alunos estrangeiros.

Enumere e detalhe as personas da sua solução. Para tanto, baseie-se tanto nos documentos disponibilizados na disciplina e/ou nos seguintes links:

> **Links Úteis**:
>
> - [Rock Content](https://rockcontent.com/blog/personas/)
> - [Hotmart](https://blog.hotmart.com/pt-br/como-criar-persona-negocio/)
> - [O que é persona?](https://resultadosdigitais.com.br/blog/persona-o-que-e/)
> - [Persona x Público-alvo](https://flammo.com.br/blog/persona-e-publico-alvo-qual-a-diferenca/)
> - [Mapa de Empatia](https://resultadosdigitais.com.br/blog/mapa-da-empatia/)
> - [Mapa de Stalkeholders](https://www.racecomunicacao.com.br/blog/como-fazer-o-mapeamento-de-stakeholders/)
>
> Lembre-se que você deve ser enumerar e descrever precisamente e personalizada todos os clientes ideais que sua solução almeja.

## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

| EU COMO... `PERSONA`               | QUERO/PRECISO ... `FUNCIONALIDADE`                                     | PARA ... `MOTIVO/VALOR`                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **João, o autônomo multitarefa**   | registrar os serviços combinados de forma rápida                       | não perder o controle do que foi acordado com o cliente.                 |
| **João, o autônomo multitarefa**   | anotar os valores pendentes de recebimento                             | saber exatamente quem está me devendo e poder cobrar.                    |
| **João, o autônomo multitarefa**   | gerar e enviar propostas de serviço de forma digital                   | agilizar o fechamento de negócios sem complicação.                       |
| **Carla, a MEI em crescimento**    | criar propostas padronizadas com a minha marca (identidade visual)     | transmitir uma imagem mais profissional aos meus clientes.               |
| **Carla, a MEI em crescimento**    | registrar os pagamentos recebidos vinculados às propostas              | centralizar as informações comerciais e financeiras no mesmo lugar.      |
| **Carla, a MEI em crescimento**    | registrar as minhas despesas recorrentes e custos operacionais         | ter controle de quanto meu negócio custa para operar mensalmente.        |
| **Carla, a MEI em crescimento**    | visualizar um painel (dashboard) com resumos e gráficos de faturamento | entender a real situação financeira do meu negócio para previsibilidade. |
| **Marcos, o pequeno empreendedor** | de um acesso compartilhado simplificado ao sistema   | que minha esposa/assistente possa me ajudar com registros e cobranças.   |
| **Marcos, o pequeno empreendedor** | visualizar rapidamente o fluxo de caixa do dia/semana                  | tomar melhores decisões sobre despesas urgentes e compras de material.   |
| **Marcos, o pequeno empreendedor** | emitir ordens de serviço claras com status de andamento                | que minha auxiliar possa acompanhar a execução dos trabalhos.            |

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.


### Requisitos Funcionais

| ID     | Descrição do Requisito                  | Prioridade | Responsável |
| ------ | --------------------------------------- | ---------- | ----------- |
| RF-001 | O sistema deve permitir que o usuário crie uma conta informando nome, CPF/CNPJ, telefone, email, endereço e senha | ALTA       | Amanda       |
| RF-002 | O sistema deve permitir que o usuário edite os dados de sua conta  | ALTA      | Amanda        |
| RF-003 | O sistema deve permitir que o usuário exclua a sua conta, removendo os dados vinculados após confirmação | ALTA       | Amanda       |
| RF-004 | O sistema deve permitir que o usuário cadastre clientes com nome, CPF/CNPJ, telefone, email e endereço   | ALTA      | Bruna        |
| RF-005 | O sistema deve permitir que o usuário edite os dados de um cliente | ALTA       | Bruna       |
| RF-006 | O sistema deve permitir que o usuário exclua um cliente, desde que não haja documentos ativos vinculados   | ALTA      | Bruna        |
| RF-007 | O sistema deve permitir que o usuário busque e filtre clientes cadastrados por nome, CPF/CNPJ, telefone, email e endereço | MÉDIA       | Bruna       |
| RF-008 | O sistema deve permitir que o usuário crie pedidos com um ou mais serviços vinculado a um cliente, definindo quantidade, valor unitário e desconto  | ALTA      | Eric        |
| RF-009 | O sistema deve permitir que o usuário edite os dados de um pedido | ALTA       | Eric       |
| RF-010 | O sistema deve permitir que o usuário exclua um pedido | ALTA      | Eric        |
| RF-011 | O sistema deve permitir que o usuário busque e filtre pedidos por cliente e nome de serviços | MÉDIA       | Frederico       |
| RF-012 | o sistema deve permitir que o usuário cadastre serviços, informando nome, descrição, valor unitário e unidade de medida  | ALTA     | Frederico        |
| RF-013 | O sistema deve permitir que o usuário edite os dados de um serviço | ALTA       | Frederico      |
| RF-014 | o sistema deve permitir que o usuário exclua um serviço, desde que não esteja vinculado a um pedido ativo   | ALTA      | Guilherme        |
| RF-015 | O sistema deve permitir que o usuário busque e filtre serviços por nome, descrição e valor  | MÉDIA       | Guilherme       |
| RF-016 | O sistema deve exibir um painel com a receita recebida, receita a receber e receita em atraso   | MÉDIA      | Guilherme        |
| RF-017 | O sistema deve apresentar um gráfico de receitas com os valores de receitas recebida, receitas a receber e receitas em atraso | BAIXA       | Maria Julia       |
| RF-018 | O sistema deve exibir um painel com os custos pagos, os custos previstos e os custos em atraso  | MÉDIA      | Maria Julia        |
| RF-019 | O sistema deve apresentar um gráfico de custos com os valores de custos pagos, os custos previstos e os custos em atraso | BAIXA      | Maria Julia      |
| RF-020 | O sistema deve permitir gerar um recibo a partir de um pagameno registrado de um pedido, contendos os dados do usuário, dados do cliente, descrição dos serviços pretados, valor pago, data e forma de pagamento | MÉDIA | Amanda        |
| RF-021 | O sistema deve permitir criar um contrato de serviço vinculado a um cliente e a um pedido, com os dados do usuário, dados do cliente, descrição dos serviços, valor, data a ser relaziado o serviço, método de pagamento e espaço para assinatura do usuário e cliente | MÉDIA  | Eric       |
| RF-022 | O sistema deve permitir que o usuário inicie uma chamada telefônica para um cliente diretamente através do aplicativo mobile  | ALTA      | Frederico       |

### Requisitos não Funcionais

| ID      | Descrição do Requisito                                            | Prioridade |
| ------- | ----------------------------------------------------------------- | ---------- |
| RNF-001 | As senhas dos usuários devem ser criptografadas utilizando algoritmo de hash seguro (bcrypt) antes de serem armazenadas no banco de dados, garantindo que nenhuma senha seja salva em texto puro | ALTA      |
| RNF-002 | Toda comunicação entre o aplicativo e o servidor deve ser realizada por meio de HTTPS, com autenticação das requisições via token JWT, garantindo que apenas usuários autenticados acessem os dados da aplicação            | ALTA      |
| RNF-003 | A interface deve ser simples e intuitiva, permitindo que o usuário realize as principais tarefas da aplicação sem necessidade de treinamento prévio ou conhecimento técnico avançado | ALTA      |
| RNF-004 | O aplicativo mobile deve funcionar corretamente nos sistemas operacionais Android e iOS, mantendo comportamento e aparência consistentes entre as duas plataformas          | MÉDIA     |
| RNF-005 | A versão web da aplicação deve funcionar corretamente nos principais navegadores modernos, incluindo Google Chrome, Mozilla Firefox, Safari e Microsoft Edge, em suas versões mais recentes | MÉDIA      |
| RNF-006 | As telas e operações principais da aplicação devem apresentar tempo de resposta inferior a 3 segundos em condições normais de uso e conectividade | ALTA      |


## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

| ID  | Restrição                                             |
| --- | ----------------------------------------------------- |
| 01  | O projeto deverá ser entregue até o final do semestre |
| 02  | O backend deverá ser desenvolvido exclusivamente em Node.js, não sendo permitida a adoção de outras linguagens ou runtimes server-side no escopo do projeto.|
| 03  | O frontend web deverá ser desenvolvido em React, e o aplicativo móvel em React Native, mantendo consistência tecnológica entre as plataformas.|
| 04  | A aplicação não poderá emitir documentos fiscais oficiais (como NF-e ou NFS-e), ficando restrita à geração de documentos comerciais informais, como propostas, ordens de serviço e recibos.|
| 05  | O sistema não integrará com sistemas bancários ou gateways de pagamento, limitando-se ao registro manual de recebimentos e despesas pelo próprio usuário.|
| 06  | A solução deverá ser desenvolvida com tecnologias acessíveis à equipe do projeto, sem dependência de licenças pagas de frameworks, plataformas ou ferramentas proprietárias.|
| 07  | O escopo da aplicação se restringe ao controle comercial e financeiro básico, não contemplando funcionalidades de CRM avançado, gestão de estoque ou módulos contábeis completos.|
| 08  | A aplicação não realizará envio automático de documentos por e-mail ou WhatsApp de forma nativa — o compartilhamento dependerá de recursos do próprio dispositivo do usuário ou de integrações futuras fora do escopo atual.|

## Diagrama de Casos de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos.

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
>
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)

# Gerenciamento de Tempo

O gerenciamento de tempo tem como objetivo planejar, organizar e controlar as atividades necessárias para o desenvolvimento do projeto dentro do prazo estabelecido.

Para facilitar esse controle, o projeto foi dividido em cinco etapas principais, cada uma contemplando atividades específicas relacionadas ao planejamento, modelagem, desenvolvimento e finalização do sistema.

Essa divisão permite acompanhar o progresso do projeto, identificar possíveis atrasos e garantir que o desenvolvimento avance de forma organizado.

## Cronograma do Projeto

| Etapa | Período |
|------|------|
| Etapa 1 | 09/02/2026 a 08/03/2026 |
| Etapa 2 | 10/03/2026 a 12/04/2026 |
| Etapa 3 | 13/04/2026 a 10/05/2026 |
| Etapa 4 | 11/05/2026 a 31/05/2026 |
| Etapa 5 | 01/06/2026 a 21/06/2026 |

## Planejamento das Atividades

| Etapa | Atividade | Início | Fim |
|------|------|------|------|
| Etapa 1 | Levantamento de requisitos | 09/02/2026 | 16/02/2026 |
| Etapa 1 | Definição do escopo do sistema | 17/02/2026 | 22/02/2026 |
| Etapa 1 | Planejamento do projeto | 23/02/2026 | 02/03/2026 |
| Etapa 1 | Elaboração da documentação inicial | 03/03/2026 | 08/03/2026 |
| Etapa 2 | Modelagem do sistema | 10/03/2026 | 20/03/2026 |
| Etapa 2 | Modelagem do banco de dados | 21/03/2026 | 30/03/2026 |
| Etapa 2 | Protótipo das interfaces | 31/03/2026 | 12/04/2026 |
| Etapa 3 | Estruturação do backend (API) | 13/04/2026 | 25/04/2026 |
| Etapa 3 | Implementação das regras de negócio | 26/04/2026 | 10/05/2026 |
| Etapa 4 | Desenvolvimento do frontend web | 11/05/2026 | 22/05/2026 |
| Etapa 4 | Desenvolvimento do aplicativo mobile | 23/05/2026 | 31/05/2026 |
| Etapa 5 | Integração dos sistemas | 01/06/2026 | 10/06/2026 |
| Etapa 5 | Testes do sistema | 11/06/2026 | 16/06/2026 |
| Etapa 5 | Ajustes finais e documentação | 17/06/2026 | 21/06/2026 |

## Gráfico de Gantt Simplificado

| Etapa | Fev | Mar | Abr | Mai | Jun |
|------|------|------|------|------|------|
| Planejamento | █████ |  |  |  |  |
| Modelagem |  | █████ |  |  |  |
| Backend |  |  | █████ |  |  |
| Frontend / Mobile |  |  |  | █████ |  |
| Integração e Testes |  |  |  |  | █████ |

---

# Gerenciamento de Equipe

O projeto será desenvolvido por uma equipe composta por seis integrantes. Todos os membros participarão das atividades de planejamento, desenvolvimento e validação do sistema.

Considerando que os integrantes possuem níveis de experiência entre júnior e pleno, as atividades serão distribuídas de forma equilibrada para incentivar a colaboração e o aprendizado coletivo.

A equipe será responsável pelo desenvolvimento das diferentes camadas da aplicação distribuída, incluindo:

- Interface web
- API backend
- Aplicação mobile
- Banco de dados
- Integração entre os componentes

## Estrutura da Equipe

| Área | Responsabilidades |
|------|------|
| Backend | Desenvolvimento da API e regras de negócio |
| Frontend Web | Desenvolvimento da interface web utilizando React |
| Mobile | Desenvolvimento do aplicativo utilizando React Native |
| Banco de Dados | Modelagem e gerenciamento do PostgreSQL |
| Integração | Comunicação entre os componentes do sistema |
| Testes | Validação das funcionalidades e qualidade do sistema |

---

# Ferramentas de Gerenciamento do Projeto

| Ferramenta | Finalidade |
|------|------|
| GitHub | Controle de versão do código |
| Git | Versionamento do código |
| Figma | Prototipação das interfaces |
| Trello / Jira | Organização das tarefas |
| Visual Studio Code | Desenvolvimento do código |
| PostgreSQL | Gerenciamento do banco de dados |

---

# Considerações Finais

A adoção de práticas de gerenciamento de projeto contribui para estruturar o desenvolvimento do sistema de forma organizada, permitindo que as atividades sejam distribuídas entre os integrantes da equipe e executadas dentro do prazo estabelecido.

Além disso, a utilização de uma arquitetura distribuída possibilita maior modularidade no desenvolvimento do sistema, permitindo que diferentes componentes sejam desenvolvidos e integrados de forma eficiente.
