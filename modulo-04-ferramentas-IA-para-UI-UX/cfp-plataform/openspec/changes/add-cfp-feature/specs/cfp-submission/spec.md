# Spec Delta

## Purpose

Permitir que palestrantes submetam propostas de palestras com validação rigorosa dos dados informados e feedback imediato de acessibilidade.

## ADDED Requirements

### Requirement: Validação de Payload de Submissão de Palestra no Backend
O sistema backend MUST validar todos os campos do payload de submissão do palestrante recebidos no endpoint de CFP de acordo com o contrato `SpeakerDTO` e rejeitar requisições com dados inconsistentes ou ausentes.

#### Scenario: Payload válido submetido com sucesso
- **WHEN** uma requisição POST é enviada com todos os campos obrigatórios (`id`, `nome`, `email`, `talkTitle`, `isGDE`) formatados corretamente
- **THEN** o sistema responde com status HTTP 201 Created ou 200 OK confirmando a submissão.

#### Scenario: Payload inválido rejeitado com Bad Request
- **WHEN** uma requisição POST é enviada sem campos obrigatórios como `email` inválido ou `nome` vazio
- **THEN** o sistema SHALL responder com status HTTP 400 Bad Request contendo detalhes das violações de validação.

### Requirement: Gerenciamento Reativo de Estado e Acessibilidade no Frontend
O formulário de submissão no frontend SHALL gerenciar seu estado através de Signals do Angular, expondo atributos WAI-ARIA para leitores de tela e desabilitando a submissão quando o formulário for inválido.

#### Scenario: Estado inicial do formulário e bloqueio do botão de envio
- **WHEN** o formulário de CFP é carregado inicialmente
- **THEN** os Signals de campos e validação iniciam em seus estados padrões e o botão de envio MUST permanecer desabilitado.

#### Scenario: Habilitação do envio após preenchimento válido
- **WHEN** o usuário preenche todos os campos obrigatórios com valores válidos
- **THEN** os Signals derivados computam o formulário como válido e o botão de envio SHALL se tornar ativo e acessível.
