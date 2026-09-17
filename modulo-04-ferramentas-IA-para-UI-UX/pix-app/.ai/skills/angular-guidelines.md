# Role: Angular Modern Guidelines Skill (Angular 21+)

**Ativação:** Esta skill é ativada automaticamente pelo Agente Principal sempre que código Angular (Componentes, Diretivas, Pipes, Serviços, Stores, Testes e Rotas) estiver sendo criado, analisado ou refatorado.

---

## 🛠️ Integração Obrigatória com MCP `angular-cli`

Sempre que o servidor MCP **`angular-cli`** estiver disponível no ambiente, o agente **DEVE** utilizá-lo ativamente antes e durante a criação, análise ou refatoração de código Angular:

1. **Validação de Melhores Práticas & Documentação Oficial:**
   - **`get_best_practices`**: Consulte sempre para validar decisões de implementação, padrões de código, performance e recomendações oficiais do time do Angular.
   - **`search_documentation`**: Pesquise a documentação oficial para obter assinaturas de APIs, sintaxes exatas e novidades das versões recentes (evitando suposições ou alucinações).
   - **`ai_tutor`**: Acione para receber orientações conceituais e guias de implementação sobre recursos modernos do Angular.

2. **Modernização & Migração OnPush/Zoneless:**
   - **`onpush_zoneless_migration`**: Use para auditar, diagnosticar ou migrar componentes legados em direção a `ChangeDetectionStrategy.OnPush` e reatividade Zoneless orientada a Signals.

3. **Inspeção de Workspace & Execução de Tarefas:**
   - **`list_projects`**: Use para inspecionar os projetos configurados no workspace (`angular.json`).
   - **`run_target`**: Use para executar targets oficiais (`build`, `test`, `lint`) e verificar a integridade da aplicação.
   - **`devserver_*`** (`devserver_start`, `devserver_wait_for_build`, `devserver_stop`): Use para gerenciar e monitorar o status de build do servidor de desenvolvimento quando aplicável.

---

## 🅰️ Diretrizes Fundamentais (Angular Moderno)

### 1. Standalone Architecture & Zoneless
- **100% Standalone:** Todos os componentes, diretivas e pipes devem ter `standalone: true` (padrão nas versões recentes) e declarar suas dependências diretamente no array `imports: [...]`. Não utilize `NgModule`.
- **Change Detection:** Todo componente DEVE adotar explicitamente `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Preparado para Zoneless:** Não confie em `NgZone` ou `tick()`. Confie na reatividade orientada a Signals.

### 2. Signals & Reatividade Fina (Fine-grained Reactivity)
- **Estado Local:** Use `signal()` para valores mutáveis e `computed()` para valores derivados e cálculos puros.
- **Side-effects Controlados:** Use `effect()` apenas para interações com APIs externas que não retornem estado (ex: `localStorage`, `analytics`, logs).
- **Inputs & Outputs:**
  - Substitua `@Input()` por `input<Type>()` ou `input.required<Type>()`.
  - Substitua `@Output()` por `output<Type>()`.
  - Para binding bidirecional, utilize `model<Type>()`.

### 3. Injeção de Dependências
- **Injeção Funcional com `inject()`:** Use `inject(ServiceClass)` no nível do campo em vez de injeções no construtor.
- Construtores devem permanecer limpos, sem argumentos desnecessários.

### 4. Built-in Control Flow
- NUNCA utilize diretivas estruturais legadas (`*ngIf`, `*ngFor`, `*ngSwitch`).
- Utilize a sintaxe moderna nativa:
  ```html
  @if (state.isLoading()) {
    <app-loading-spinner />
  } @else if (state.hasError()) {
    <app-error-banner [message]="state.errorMessage()" />
  } @else {
    @for (item of state.items(); track item.id) {
      <app-card [data]="item" />
    } @empty {
      <p class="empty-state">Nenhum item encontrado.</p>
    }
  }
  ```
- No `@for`, a cláusula `track` é **obrigatória** (utilize preferencialmente um identificador único como `item.id`).

### 5. Deferrable Views (`@defer`)
- Em seções pesadas da página ou componentes que não estão visíveis no primeiro viewport, aplique `@defer`:
  ```html
  @defer (on viewport) {
    <app-heavy-chart [data]="chartData()" />
  } @placeholder {
    <div class="skeleton-chart" aria-hidden="true"></div>
  } @loading (minimum 300ms) {
    <p>Carregando gráfico...</p>
  }
  ```

---

## 🏛️ Clean Architecture & Padrões no Angular

### Camadas de Separação
1. **Domain (Núcleo):**
   - Modelos de dados puros (`interface`, `type`), Value Objects (ex: CPF, Moeda) e regras de negócio puras.
   - Classes abstratas definindo contratos (Ports): `abstract class PixTransferPort`.
2. **Infrastructure (Adaptadores):**
   - Implementação de clientes HTTP, LocalStorage e integrações externas: `class PixTransferHttpAdapter extends PixTransferPort`.
3. **Application (Orquestração):**
   - **Facades:** Classe de orquestração injetável que conecta a UI aos Use Cases, Stores e Serviços de Infraestrutura.
   - **State Store:** Gerenciamento reativo com `SignalStore` ou Services baseados em `signal()` encapsulados.
4. **UI Layer (Container / Presenter Pattern):**
   - **Smart Containers:** Conectam-se ao Facade/Store, escutam rotas e passam dados aos Presenters. Quase nenhum SCSS complexo.
   - **Dumb Presenters:** Apenas recebem dados via `input()` (Signals) e notificam ações via `output()`. 100% focados em renderização acessível e estilos.

---

## 🧪 TypeScript Strict & Qualidade de Código
- Tipagem 100% estrita: proíba o uso de `any` (utilize `unknown` com type guards ou tipos genéricos).
- Funções puras e imutabilidade no tratamento de listas e objetos.
