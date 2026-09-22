# Proposal

## Why

A plataforma necessita de um canal unificado e acessível para que palestrantes (speakers) enviem propostas de palestras (Call for Papers - CFP). A solução deve assegurar a integridade dos dados trafegados entre o cliente e o servidor através de contratos compartilhados fortemente tipados, validação rigorosa de payload na API, gestão de estado reativa e moderna no frontend com padrões WAI-ARIA para acessibilidade, além de uma suíte de testes unitários para confiabilidade.

## What Changes

- **Shared Types**:
  - Consumo do contrato `SpeakerDTO` (já existente em `@cfp-plataform/shared-types`) tanto na API quanto no Frontend para manter a integridade estrutural da submissão.
- **Backend (`apps/api` - NestJS)**:
  - Adição de dependências de validação (`class-validator` e `class-transformer`) e ativação do `ValidationPipe` global.
  - Criação de DTO de submissão com decorators do `class-validator` alinhado ao `SpeakerDTO`.
  - Criação de controller e service em `apps/api/src/app/cfp` com endpoint `POST /api/cfp` recebendo `@Body()`.
  - Criação de testes unitários com Jest para garantir que requisições com dados inválidos retornem HTTP 400 (Bad Request) e requisições válidas sejam processadas com sucesso.
- **Frontend (`apps/frontend` - Angular)**:
  - Criação do componente standalone de submissão de CFP (`CfpFormComponent`) utilizando Signals (`signal`, `computed`) para gerenciar o estado do formulário e estado de submissão.
  - Implementação de atributos WAI-ARIA nos campos, mensagens de erro e feedback de acessibilidade (`aria-invalid`, `aria-describedby`, `aria-live`, `aria-busy`).
  - Desabilitação reativa do botão de envio enquanto o formulário/dados forem inválidos ou estiverem em estado de envio.
  - Criação de testes unitários cobrindo o estado inicial dos Signals e a validação do bloqueio do botão de envio.

## Capabilities

### New Capabilities
- `cfp-submission`: Implementação do fluxo completo de Call for Papers, permitindo submissão de propostas de palestras via frontend Angular reativo e processamento validado via API NestJS.

### Modified Capabilities
<!-- Nenhuma capacidade existente teve seus requisitos alterados -->

## Impact

- **Código e Arquitetura**:
  - Novas rotas e controllers em `apps/api/src/app/cfp/`.
  - Novo componente e rotas no Angular em `apps/frontend/src/app/cfp/`.
  - Configuração de `ValidationPipe` em `apps/api/src/main.ts`.
- **Dependências**:
  - Instalação de `class-validator` e `class-transformer` no projeto backend.
- **APIs**:
  - Novo endpoint `POST /api/cfp` que consome e valida o payload baseado em `SpeakerDTO`.
- **Contratos**:
  - Uso estrito do contrato `@cfp-plataform/shared-types`.
