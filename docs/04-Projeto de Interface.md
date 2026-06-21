# Projeto de Interface

<span style="color:red">Pré-requisitos: <a href="02-Especificação do Projeto.md"> Documentação de Especificação</a></span>

Este documento apresenta a visão geral da interação do usuário com as principais telas do sistema nas versões web e mobile. A solução foi organizada para priorizar fluxos curtos, leitura rápida do estado do negócio e execução direta das ações mais frequentes.

As interfaces foram elaboradas de forma a atender os requisitos funcionais do sistema, especialmente autenticação, manutenção de clientes, catálogo, pedidos, lançamentos financeiros, emissão de documentos e contato rápido com clientes.

## Diagrama de Fluxo

O fluxo principal da aplicação pode ser resumido da seguinte forma:

1. O usuário cria conta ou realiza login.
2. Após autenticação, acessa o painel principal com visão resumida do financeiro.
3. A partir da navegação principal, pode acessar clientes, catálogo, pedidos e configurações.
4. Nos módulos operacionais, pode criar, editar, excluir e consultar registros.
5. Em pedidos e lançamentos, pode emitir documentos em PDF conforme as regras do sistema.
6. Em clientes, pode acionar rapidamente telefone e WhatsApp quando houver telefone válido.

Na versão web, a navegação prioriza listas com ações contextuais por item, cabeçalhos fixos, filtros e visualização direta dos documentos. Na versão mobile, a navegação prioriza tabs, telas de detalhe e menus contextuais adaptados ao toque.

> **Pendência registrada:** o diagrama visual desta seção deve ser atualizado para refletir os fluxos reais atuais de login, dashboard, clientes, catálogo, pedidos, documentos e ações rápidas de contato.

## Wireframes

As principais interfaces do sistema implementado são:

### Interface Web

- **Login e cadastro:** entrada do sistema com autenticação por sessão.
- **Dashboard financeiro:** exibe KPIs, gráfico resumido, filtros por período e listagem recente de lançamentos.
- **Clientes:** listagem paginada com busca, filtro por tipo, ações de editar, excluir, ligar e abrir WhatsApp.
- **Catálogo:** listagem e manutenção de produtos e serviços com foco em reaproveitamento nos pedidos.
- **Pedidos:** lista por status, busca, criação, edição, exclusão e emissão de orçamento/ordem de serviço.
- **Documentos:** páginas de preview para orçamento, ordem de serviço e recibo, com abertura e download do PDF.
- **Configurações:** edição do perfil do usuário e do negócio.

### Interface Mobile

- **Autenticação:** login e cadastro com guarda de sessão.
- **Dashboard:** resumo financeiro, listagem recente e emissão contextual de recibo.
- **Clientes:** listagem com navegação para detalhe, cadastro, edição, exclusão e ações rápidas de contato.
- **Catálogo:** listagem, cadastro e edição de itens.
- **Pedidos:** listagem, criação, edição, detalhe e emissão de documentos.
- **Configurações:** edição dos dados do usuário e do negócio.

### Decisões de Interface

- priorização de ações operacionais na própria lista, reduzindo a dependência de telas intermediárias;
- uso de feedback de loading, erro e confirmação nas operações críticas;
- separação visual clara entre ações administrativas e ações operacionais;
- adaptação dos fluxos de documento por plataforma: preview web e abertura/compartilhamento externo no mobile nativo.

> **Pendência registrada:** os wireframes e capturas desta seção devem ser substituídos por representações reais das telas implementadas. Os exemplos visuais antigos não devem ser tratados como fonte de verdade da interface atual.

> **Links Úteis**:
>
> - [Protótipos vs Wireframes](https://www.nngroup.com/videos/prototypes-vs-wireframes-ux-projects/)
> - [Ferramentas de Wireframes](https://rockcontent.com/blog/wireframes/)
> - [Figma](https://www.figma.com/)
