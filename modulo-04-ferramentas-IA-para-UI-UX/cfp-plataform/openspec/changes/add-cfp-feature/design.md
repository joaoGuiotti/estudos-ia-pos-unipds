# Design

## Context

A arquitetura atual é um Nx Monorepo composto por:
- `api`: Aplicação backend NestJS (`apps/api`).
- `frontend`: Aplicação Angular moderna com suporte a standalone components (`apps/frontend`).
- `shared-types`: Biblioteca de tipos TypeScript com path mapping configurado (`@cfp-plataform/shared-types`), contendo a interface `SpeakerDTO`.

Vide [proposal.md](proposal.md) para a motivação geral do negócio e [spec.md](specs/cfp-submission/spec.md) para os requisitos normativos e cenários.

## Goals / Non-Goals

**Goals:**
- Implementar o endpoint REST de submissão de CFP (`POST /api/cfp`) no NestJS com `@Body()` e validação via `class-validator`.
- Integrar e aplicar o `ValidationPipe` com `{ whitelist: true, forbidNonWhitelisted: true }`.
- Garantir que o DTO backend e o formulário frontend compartilhem e respeitem a interface `SpeakerDTO` exportada por `@cfp-plataform/shared-types`.
- Criar componente Angular standalone (`CfpFormComponent`) orientado a Signals (`signal`, `computed`) para gerenciar todo o ciclo de vida do formulário sem depender do paradigma reativo clássico baseado em RxJS para o estado local.
- Adotar atributos WAI-ARIA para total acessibilidade (`aria-invalid`, `aria-describedby`, `aria-live`, `aria-busy`, `aria-required`).
- Implementar suíte de testes unitários com Jest para backend (verificando rejeição com HTTP 400 em payloads inválidos) e para frontend (validando o estado inicial dos Signals e bloqueio do botão de envio).

**Non-Goals:**
- Integração com banco de dados relacional ou NoSQL persistente nesta etapa (dados podem ser mantidos em memória/mock service).
- Sistema de autenticação e autorização complexo (JWT, OAuth) para os palestrantes.
- Interface administrativa para curadoria ou aprovação de palestras.

## Decisions

### 1. Contrato e Validação de Dados (Shared Types + NestJS DTO)
- **Decisão**: Criar a classe `CreateSpeakerDto` no backend que implementa a interface `SpeakerDTO` de `@cfp-plataform/shared-types`, decorando as propriedades com decorators do `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `@IsBoolean()`, `@IsUUID()` ou `@IsOptional()`).
- **Alternativa Considerada**: Validação manual no controller ou com bibliotecas de schema runtime (ex: Zod). Descartada para manter conformidade com os padrões idiomáticos do ecossistema NestJS (`class-validator` + `ValidationPipe`).

### 2. Gestão de Estado no Frontend com Angular Signals
- **Decisão**: Utilizar `signal()` para modelar as propriedades do formulário (`nome`, `email`, `talkTitle`, `isGDE`, `isSubmitting`, `touchedFields`) e `computed()` para derivar a validade (`isFormValid`) e mensagens de erro contextuais.
- **Alternativa Considerada**: `ReactiveFormsModule` tradicional (`FormGroup` / `FormControl`). O uso de Signals nativos atende à exigência de arquitetura moderna do Angular e simplifica a reatividade fina do template.

### 3. Acessibilidade WAI-ARIA
- **Decisão**: Mapear programaticamente estados dos inputs com:
  - `aria-required="true"` em campos obrigatórios.
  - `[attr.aria-invalid]="isFieldInvalid('nome')"` refletindo o sinal computado.
  - `[attr.aria-describedby]="'nome-error'"` associado ao container de erro `<span id="nome-error" role="alert" aria-live="polite">`.
  - `[attr.aria-busy]="isSubmitting()"` e `[disabled]="!isFormValid() || isSubmitting()"` no botão de submissão.
- **Alternativa Considerada**: Deixar apenas atributos HTML5 nativos (`required`, `type="email"`). Descartada para assegurar compatibilidade plena com leitores de tela em fluxos dinâmicos.

### 4. Estratégia de Testes Unitários com Jest
- **Decisão**:
  - Backend: Testes do `ValidationPipe` e `CfpController` usando `@nestjs/testing` e instâncias do DTO com `validate` do `class-validator` para verificar asserções de 400 Bad Request em cenários de falha.
  - Frontend: Testes isolados com Jest validando:
    1. Que ao instanciar o componente, `isFormValid()` inicia como `false` e o botão de envio está desabilitado.
    2. Que após preenchimento válido dos signals, `isFormValid()` torna-se `true` e o botão é habilitado.

## Risks / Trade-offs

- **[Risco] Dependências ausentes no monorepo**: `class-validator` e `class-transformer` não estão presentes no `package.json`.
  - *Mitigação*: Instalar `class-validator` e `class-transformer` no início das tarefas do backend.
- **[Risco] Desvio de contrato entre DTO e Interface**: Alterações futuras em `SpeakerDTO` podem quebrar o DTO backend silenciosamente se a classe não implementar a interface estritamente.
  - *Mitigação*: O TypeScript emitirá erro de compilação em `class CreateSpeakerDto implements SpeakerDTO` caso qualquer campo divirja.
