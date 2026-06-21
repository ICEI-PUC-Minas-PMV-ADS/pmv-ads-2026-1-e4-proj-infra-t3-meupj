# MEUPJ

Projeto acadêmico de um sistema para organização comercial e financeira de pequenos negócios, com backend, web e mobile no mesmo repositório.

## Curso

- Análise e Desenvolvimento de Sistemas
- Desenvolvimento de uma Aplicação Distribuída
- Etapa 4

## Integrantes

- Frederico Furtado Amantino Vieira
- Guilherme de Andrade Castro Vieira
- Maria Julia Gonçalves Maia Sales
- Eric Esteves Martins
- Amanda Vitor Lopes
- Bruna Bricio Alvarenga Sampaio

## Orientador

- Carolina Stephanie Jerônimo de Almeida

## Estado Atual do Projeto

O código ativo do sistema está centralizado em [`src/`](src/README.md), que hoje reúne:

- API em Fastify com MongoDB, Better Auth e geração de documentos PDF
- aplicação web em Next.js
- aplicação mobile em Expo, com suporte web para desenvolvimento

As funcionalidades implementadas e verificáveis atualmente estão descritas no README técnico de [`src/`](src/README.md). Esse é o ponto de entrada canônico para entender a solução em funcionamento.

## Como Rodar

Os comandos do sistema devem ser executados a partir de [`src/`](src/README.md):

```bash
cd src
pnpm install
pnpm dev
```

Comandos principais do monorepo:

```bash
cd src
pnpm build
pnpm lint
pnpm test
```

## Documentação do Repositório

- [`src/README.md`](src/README.md): documentação técnica canônica do código atual
- [`docs/`](docs): artefatos acadêmicos organizados por etapa
- [`presentation/README.md`](presentation/README.md): orientação sobre os materiais de apresentação
- [`videos/README.md`](videos/README.md): orientação sobre os registros em vídeo
