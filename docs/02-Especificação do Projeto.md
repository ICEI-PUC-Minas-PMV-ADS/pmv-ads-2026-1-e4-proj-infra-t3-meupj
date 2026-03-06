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

<strong>Crie no mínimo 12 Requisitos funcionais, 6 não funcionais e 3 restrições</strong>
<strong>Cada aluno será responsável pela execução completa (back, web e mobile) de pelo menos 2 requisitos que será acompanhado pelo professor</strong>

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
| RNF-001 | O sistema deve ser responsivo para rodar em um dispositivos móvel | MÉDIA      |
| RNF-002 | Deve processar requisições do usuário em no máximo 3s             | BAIXA      |

Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

- [Requisitos Funcionais
  (RF)](https://pt.wikipedia.org/wiki/Requisito_funcional):
  correspondem a uma funcionalidade que deve estar presente na
  plataforma (ex: cadastro de usuário).
- [Requisitos Não Funcionais
  (RNF)](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional):
  correspondem a uma característica técnica, seja de usabilidade,
  desempenho, confiabilidade, segurança ou outro (ex: suporte a
  dispositivos iOS e Android).
  Lembre-se que cada requisito deve corresponder à uma e somente uma
  característica alvo da sua solução. Além disso, certifique-se de que
  todos os aspectos capturados nas Histórias de Usuário foram cobertos.

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

# Gerenciamento de Projeto

De acordo com o PMBoK v6 as dez áreas que constituem os pilares para gerenciar projetos, e que caracterizam a multidisciplinaridade envolvida, são: Integração, Escopo, Cronograma (Tempo), Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Para desenvolver projetos um profissional deve se preocupar em gerenciar todas essas dez áreas. Elas se complementam e se relacionam, de tal forma que não se deve apenas examinar uma área de forma estanque. É preciso considerar, por exemplo, que as áreas de Escopo, Cronograma e Custos estão muito relacionadas. Assim, se eu amplio o escopo de um projeto eu posso afetar seu cronograma e seus custos.

## Gerenciamento de Tempo

Com diagramas bem organizados que permitem gerenciar o tempo nos projetos, o gerente de projetos agenda e coordena tarefas dentro de um projeto para estimar o tempo necessário de conclusão.

![Diagrama de rede simplificado notação francesa (método francês)](img/02-diagrama-rede-simplificado.png)

O gráfico de Gantt ou diagrama de Gantt também é uma ferramenta visual utilizada para controlar e gerenciar o cronograma de atividades de um projeto. Com ele, é possível listar tudo que precisa ser feito para colocar o projeto em prática, dividir em atividades e estimar o tempo necessário para executá-las.

![Gráfico de Gantt](img/02-grafico-gantt.png)

## Gerenciamento de Equipe

O gerenciamento adequado de tarefas contribuirá para que o projeto alcance altos níveis de produtividade. Por isso, é fundamental que ocorra a gestão de tarefas e de pessoas, de modo que os times envolvidos no projeto possam ser facilmente gerenciados.

![Simple Project Timeline](img/02-project-timeline.png)
