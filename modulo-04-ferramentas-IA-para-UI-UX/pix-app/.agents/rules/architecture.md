# 🏛️ Diretrizes Arquiteturais (Clean Architecture & Patterns)

1. **Domain & Application (Núcleo desacoplado):**
   - Regras de negócio puras, entidades e Value Objects (ex: CPF, Valor Pix).
   - Sem dependência do framework Angular no domínio.
2. **Ports & Adapters (Classes Abstratas):**
   - Contratos definidos por classes abstratas ou interfaces (`Ports`).
   - Implementações de infraestrutura e serviços externos como `Adapters`.
3. **Container / Presenter Pattern:**
   - **Containers (Smart):** Orquestram o estado, injetam Facades e manipulam rotas. Template enxuto, sem CSS complexo.
   - **Presenters (Dumb):** 100% visuais. Recebem estado via `input()` (Signals) e notificam ações via `output()`. As Skills de A11y e Lucide Icons são mandatórias nesta camada.
4. **Facades:**
   - Orquestram chamadas entre Stores, APIs HTTP e componentes de UI na camada de aplicação.
5. **State Management:**
   - Use Angular SignalStore, NgRx ou Services reativos utilizando exclusivamente Signals (`signal()`, `computed()`).
