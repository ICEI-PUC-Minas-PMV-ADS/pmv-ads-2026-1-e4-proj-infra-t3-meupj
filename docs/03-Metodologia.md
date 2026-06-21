# Metodologia

<span style="color:red">Pré-requisitos: <a href="02-Especificação do Projeto.md"> Documentação de Especificação</a></span>

Este documento descreve a metodologia de trabalho utilizada pela equipe para desenvolver o projeto, incluindo os ambientes de trabalho, a organização do código, o processo de execução e as ferramentas adotadas ao longo do desenvolvimento.

## Relação de Ambientes de Trabalho

Os artefatos do projeto foram desenvolvidos em ambientes distintos, cada um com um propósito específico dentro da solução distribuída.

| Ambiente                    | Plataforma          | Finalidade                                                     |
| --------------------------- | ------------------- | -------------------------------------------------------------- |
| Repositório do projeto      | GitHub              | Hospedagem do código-fonte, versionamento e colaboração        |
| Monorepo da aplicação       | `pnpm` + `turbo`    | Organização conjunta de API, web e mobile                      |
| Backend                     | Fastify + MongoDB   | Regras de negócio, autenticação, persistência e documentos PDF |
| Frontend web                | Next.js             | Interface principal no navegador                               |
| Aplicação mobile            | Expo + React Native | Interface mobile com suporte web para desenvolvimento          |
| Gestão das tarefas          | Linear              | Organização do backlog e acompanhamento das entregas           |
| Prototipação e apoio visual | Figma               | Referência para fluxos, telas e organização visual             |

## Controle de Versão

A ferramenta de controle de versão adotada no projeto foi o [Git](https://git-scm.com/), com o [GitHub](https://github.com) utilizado para hospedagem do repositório.

Durante o desenvolvimento, o time trabalhou com uma branch principal do projeto e ramificações de apoio para evolução de funcionalidades, correções e documentação, sempre preservando o histórico das mudanças realizadas no código-fonte.

Quanto ao acompanhamento das atividades, o projeto utilizou organização externa de tarefas para registrar frentes de trabalho, priorização e andamento da implementação.

## Gerenciamento de Projeto

### Divisão de Papéis

A equipe adotou uma divisão prática por frentes de desenvolvimento, com participação cruzada entre backend, web, mobile, testes e documentação.

- Coordenação técnica e integração do monorepo: Frederico
- Frentes de autenticação, perfil e validação funcional: Frederico
- Frentes de clientes, documentação e organização dos artefatos:
- Frentes de pedidos, documentos comerciais e regras de negócio associadas: 
- Frentes de lançamentos financeiros, dashboard e apoio técnico geral: 
- Frentes de catálogo, revisão de qualidade e apoio à validação: 

### Processo

O processo adotado foi incremental e colaborativo. A equipe iniciou com levantamento e modelagem, avançou para a construção do backend e, na sequência, integrou as interfaces web e mobile ao mesmo núcleo de regras de negócio.

Ao longo da execução, o fluxo de trabalho foi orientado por:

- definição das funcionalidades prioritárias por etapa;
- implementação por módulos de domínio;
- validação contínua das integrações entre API, web e mobile;
- registro dos testes e da documentação conforme a evolução do sistema;
- ajustes finais de consistência, desempenho e aderência ao escopo acadêmico.

### Ferramentas

As ferramentas empregadas no projeto foram:

- `Visual Studio Code` como editor de código principal;
- `Git` e `GitHub` para versionamento e colaboração;
- `Linear` para organização das tarefas;
- `Figma` para apoio à estrutura visual e fluxos de interface;
- `MongoDB` como banco de dados do sistema;
- `Bruno` e navegadores para validação de endpoints e fluxos da aplicação;
- `pnpm` e `turbo` para orquestração do monorepo.

As escolhas foram motivadas pela compatibilidade com a stack adotada, facilidade de colaboração e aderência ao contexto acadêmico do projeto.
