---
name: refactoring-guru
description: >-
  Use esta skill sempre que código estiver sendo analisado, revisado, refatorado
  ou quando novos módulos, serviços e entidades de domínio forem estruturados.
  Fornece catálogo de Code Smells, técnicas de refatoração e Design Patterns (GoF)
  aplicados a TypeScript e Angular moderno.
---

# 🛠️ Refactoring Guru & Code Quality Skill

## Fontes e Referências Oficiais
- **Catálogo Oficial:** [Refactoring.Guru — Refactoring](https://refactoring.guru/refactoring) e [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns)

## Mindset e Regras de Ouro
1. **Pequenas mudanças seguras:** Priorize alterações localizadas e incrementais que preservem o comportamento observável do sistema.
2. **Identifique os Smells antes de agir:** Sempre nomeie explicitamente os *Code Smells* identificados antes de propor uma refatoração.
3. **Refatoração antes de Padrões:** Aplique técnicas de refatoração simples primeiro; introduza um *Design Pattern (GoF)* somente quando forças arquiteturais reais exigirem.
4. **Não faça "Pattern-Spray":** Evite padrões pesados quando funções puras, injeção de dependência simples ou composição resolverem o problema.
5. **Preserve testes e contratos:** Garanta que a assinatura pública ou os contratos de porta/adaptador continuem válidos.

## Catálogo de Code Smells (Diagnóstico)

### 1. Bloaters (Inchaços)
- **Long Method:** → `Extract Method`, `Replace Temp with Query`.
- **Large Class:** → `Extract Class`, `Extract Interface`.
- **Primitive Obsession:** → `Replace Data Value with Object`.
- **Long Parameter List:** → `Introduce Parameter Object`, `Preserve Whole Object`.
- **Data Clumps:** → `Extract Class / Interface`.

### 2. Object-Orientation Abusers
- **Switch Statements / Complex If-Else:** → `Replace Conditional with Polymorphism` (Strategy Pattern).
- **Temporary Field:** → `Extract Class`.
- **Alternative Classes with Different Interfaces:** → `Adapter Pattern` ou unificação.

### 3. Change Preventers
- **Divergent Change:** → Separe responsabilidades em classes dedicadas (SRP).
- **Shotgun Surgery:** → `Move Method`, `Move Field` para consolidar o conceito.

### 4. Dispensables
- **Duplicate Code:** → `Extract Method`, `Pull Up Method`.
- **Dead Code:** → Remoção limpa imediata.
- **Speculative Generality:** → Remover abstrações desnecessárias (YAGNI).
- **Comments as Deodorant:** → Refatorar nomes para torná-los autoexplicativos.

### 5. Couplers
- **Feature Envy:** → `Move Method`.
- **Inappropriate Intimacy:** → Encapsular via Facade ou Interfaces públicas.

## Design Patterns Aplicados a TypeScript & Angular Moderno

| Categoria | Padrão | Cenário de Uso no Angular |
| :--- | :--- | :--- |
| **Criacional** | **Factory Method** | Criação dinâmica de estratégias de validação ou de tipos de chaves Pix. |
| **Estrutural** | **Adapter** | Converter respostas de APIs externas para os modelos de Domínio. |
| **Estrutural** | **Facade** | Unificar o acesso a SignalStores, APIs HTTP e regras de negócio. |
| **Comportamental**| **Strategy** | Algoritmos intercambiáveis de formatação e validação. |
| **Comportamental**| **Observer / Signals** | Reatividade nativa usando `signal()`, `computed()` e `effect()`. |

## Fluxo de Resposta ao Refatorar
1. **Diagnóstico:** Aponte o trecho do código e cite o nome do *Code Smell*.
2. **Técnica Selecionada:** Indique a técnica do catálogo (ex: `Extract Method`).
3. **Código Refatorado:** Apresente o código limpo, tipado estritamente e documentado.
4. **Benefício / Trade-off:** Explique como a alteração melhorou a manutenibilidade.
