# Programação de Funcionalidades

<span style="color:red">Pré-requisitos: <a href="02-Especificação do Projeto.md"> Especificação do Projeto</a></span>, <a href="04-Projeto de Interface.md"> Projeto de Interface</a>, <a href="03-Metodologia.md"> Metodologia</a>, <a href="05-Arquitetura da Solução.md"> Arquitetura da Solução</a>

Este documento relaciona as funcionalidades implementadas no sistema com os módulos reais da solução distribuída, além de indicar a forma prática de verificação das entregas.

## Autenticação e Sessão

Requisitos atendidos:

- RF-001
- RF-002

Implementação entregue:

- criação de conta por meio das rotas de autenticação;
- login com sessão autenticada;
- proteção das áreas privadas da aplicação;
- compartilhamento da autenticação entre API, web e mobile conforme a plataforma.

Forma de verificação:

- criar uma conta nova;
- realizar login;
- confirmar acesso às áreas autenticadas;
- invalidar a sessão por logout ou ausência de credencial.

## Perfil do Negócio e Configurações

Requisitos atendidos:

- RF-003

Implementação entregue:

- leitura consolidada de `user` e `business`;
- edição do perfil do negócio;
- reutilização dos dados do negócio na geração dos documentos PDF.

Forma de verificação:

- acessar configurações;
- editar nome, documento, telefone, email, rodapé e endereço;
- emitir documento e conferir reaproveitamento das informações.

## Clientes

Requisitos atendidos:

- RF-004
- RF-005
- RF-006
- RF-007
- RF-022
- RF-023

Implementação entregue:

- cadastro, edição, exclusão, listagem, busca e filtros;
- validação de vínculos na exclusão;
- ação rápida de telefone e WhatsApp quando houver telefone válido;
- operação disponível no web e no mobile, respeitando o contexto de cada interface.

Forma de verificação:

- cadastrar cliente;
- editar cliente;
- buscar cliente por texto;
- excluir cliente elegível;
- acionar telefone e WhatsApp a partir da lista.

## Catálogo

Requisitos atendidos:

- RF-012
- RF-013
- RF-014
- RF-015

Implementação entregue:

- cadastro e manutenção de serviços e produtos;
- uso do catálogo como base para composição dos pedidos;
- proteção contra exclusão indevida quando houver vínculo impeditivo.

Forma de verificação:

- cadastrar item;
- editar item;
- localizar item por busca e filtro;
- tentar excluir item vinculado a pedido e validar bloqueio.

## Pedidos

Requisitos atendidos:

- RF-008
- RF-009
- RF-010
- RF-011

Implementação entregue:

- criação de pedidos com itens do catálogo;
- cliente opcional e condições comerciais;
- edição com regras de status;
- listagem com filtros, busca e ações contextuais;
- exclusão condicionada às regras do negócio.

Forma de verificação:

- criar pedido com um ou mais itens;
- alterar status e condições comerciais;
- editar pedido existente;
- excluir pedido elegível;
- localizar pedido por busca e filtros.

## Lançamentos Financeiros e Dashboard

Requisitos atendidos:

- RF-016
- RF-017
- RF-018

Implementação entregue:

- registro de receitas e custos;
- edição de lançamentos;
- bloqueio de exclusão para lançamentos confirmados, conforme regra atual;
- painel financeiro com indicadores resumidos;
- listagem recente de movimentações e resumo por categoria.

Forma de verificação:

- criar lançamento de receita e de custo;
- editar lançamento existente;
- tentar excluir lançamento confirmado;
- conferir atualização dos KPIs no dashboard.

## Documentos Comerciais em PDF

Requisitos atendidos:

- RF-019
- RF-020
- RF-021

Implementação entregue:

- emissão de recibo para lançamento confirmado;
- emissão de orçamento para pedido elegível;
- emissão de ordem de serviço para pedido elegível;
- geração do PDF no backend;
- preview autenticado no web;
- abertura ou compartilhamento externo no mobile.

Forma de verificação:

- abrir ação de documento em pedido ou lançamento compatível;
- validar abertura do PDF na plataforma correspondente;
- verificar indisponibilidade quando o status não permitir a emissão.

## Aplicações Web e Mobile

A solução foi implementada como monorepo com três aplicações integradas:

- API responsável por autenticação, regras de negócio, persistência e documentos;
- aplicação web para operação principal no navegador;
- aplicação mobile em Expo para uso em dispositivos móveis e validação web.

As três frentes compartilham o mesmo domínio funcional e seguem contratos HTTP comuns, reduzindo divergência entre plataformas.
