# Tasks

## 1. Backend: Dependências e DTO de Contrato

- [ ] 1.1 Instalar dependências `class-validator` e `class-transformer` no monorepo e verificar sucesso da instalação no `package.json`
- [ ] 1.2 Configurar o `ValidationPipe` global com `whitelist: true` em `apps/api/src/main.ts`
- [ ] 1.3 Criar o DTO `CreateSpeakerDto` em `apps/api/src/app/cfp/dto/create-speaker.dto.ts` implementando o contrato `SpeakerDTO` importado de `@cfp-plataform/shared-types` com decorators de validação (`@IsString`, `@IsEmail`, `@IsNotEmpty`, `@IsBoolean`)

## 2. Backend: Controller, Service e Testes Unitários

- [ ] 2.1 Implementar `CfpService` e `CfpController` em `apps/api/src/app/cfp/` expondo `POST /api/cfp` com `@Body()` e registrar no `AppModule`
- [ ] 2.2 Criar suíte de testes unitários com Jest em `apps/api/src/app/cfp/cfp.controller.spec.ts` validando o recebimento de payload válido e garantindo rejeição com 400 Bad Request em payloads inválidos (e.g., e-mail inválido, nome ausente)

## 3. Frontend: Componente Standalone com Signals e WAI-ARIA

- [ ] 3.1 Criar o componente standalone `CfpFormComponent` em `apps/frontend/src/app/cfp/cfp-form.component.ts` utilizando o contrato `SpeakerDTO` de `@cfp-plataform/shared-types`
- [ ] 3.2 Implementar o gerenciamento reativo do formulário via Signals (`signal` para campos e submissão, `computed` para validação geral `isFormValid` e mensagens de erro)
- [ ] 3.3 Adicionar marcação semântica e atributos WAI-ARIA no template (`aria-required`, `aria-invalid`, `aria-describedby`, containers com `role="alert"` e `aria-live="polite"`, `aria-busy` no botão de envio)
- [ ] 3.4 Configurar o bloqueio reativo do botão de submissão com `[disabled]="!isFormValid() || isSubmitting()"`

## 4. Frontend: Testes Unitários com Jest

- [ ] 4.1 Criar testes unitários em `apps/frontend/src/app/cfp/cfp-form.component.spec.ts` validando o estado inicial dos Signals do formulário
- [ ] 4.2 Adicionar cenários de teste unitário garantindo que o botão de envio permanece desabilitado no estado inicial e é habilitado somente após preenchimento válido de todos os campos

## 5. Verificação e Validação

- [ ] 5.1 Executar a suíte de testes unitários da API (`nx test api`) e verificar que todos os testes passaram
- [ ] 5.2 Executar a suíte de testes unitários do Frontend (`nx test frontend`) e verificar que todos os testes passaram
