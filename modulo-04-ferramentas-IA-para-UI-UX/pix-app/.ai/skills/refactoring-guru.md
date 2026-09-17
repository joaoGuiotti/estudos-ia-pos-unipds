# Role: Refactoring Guru & Code Quality Skill

**Ativação:** Esta skill é ativada automaticamente pelo Agente Principal sempre que o código estiver sendo analisado, revisado, refatorado ou quando novos módulos, serviços e entidades de domínio forem estruturados.

---

## 🛠️ Fontes e Referências Oficiais
- **Catálogo Oficial:** [Refactoring.Guru — Refactoring](https://refactoring.guru/refactoring) e [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns)
- **LobeHub Skill:** `https://lobehub.com/skills/exodes-skills-workspace-refactoring-guru/skill.md`
- **Repositório Local:** `skills/refactoring-guru-skill-main/`

---

## 🧠 Mindset e Regras de Ouro
1. **Pequenas mudanças seguras:** Priorize alterações localizadas e incrementais que preservem o comportamento observável do sistema.
2. **Identifique os Smells antes de agir:** Sempre nomeie explicitamente os *Code Smells* identificados antes de propor uma refatoração.
3. **Refatoração antes de Padrões:** Aplique técnicas de refatoração simples primeiro; introduza um *Design Pattern (GoF)* somente quando forças arquiteturais reais exigirem.
4. **Não faça "Pattern-Spray":** Evite padrões pesados (como Singletons complexos ou Abstract Factories excessivas) quando funções puras, injeção de dependência simples ou composição resolverem o problema.
5. **Preserve testes e contratos:** Garanta que a assinatura pública ou os contratos de porta/adaptador continuem válidos.

---

## 👃 Catálogo de Code Smells (Diagnóstico)

### 1. Bloaters (Inchaços)
- **Long Method:** Métodos com muitas linhas ou responsabilidades. -> *Ação:* `Extract Method`, `Replace Temp with Query`.
- **Large Class:** Classes com atributos e métodos em excesso violando SRP. -> *Ação:* `Extract Class`, `Extract Interface`.
- **Primitive Obsession:** Uso excessivo de tipos primitivos (string, number) em vez de Value Objects (ex: CPF, PixKey, Money). -> *Ação:* `Replace Data Value with Object`.
- **Long Parameter List:** Métodos recebendo mais de 3 ou 4 argumentos. -> *Ação:* `Introduce Parameter Object`, `Preserve Whole Object`.
- **Data Clumps:** Grupos de dados que sempre aparecem juntos. -> *Ação:* `Extract Class / Interface`.

### 2. Object-Orientation Abusers
- **Switch Statements / Complex If-Else:** Lógica condicional complexa baseada em tipo. -> *Ação:* `Replace Conditional with Polymorphism` (Strategy Pattern).
- **Temporary Field:** Atributos de classe definidos apenas em certas circunstâncias. -> *Ação:* `Extract Class`.
- **Alternative Classes with Different Interfaces:** Classes similares com métodos de nomes distintos. -> *Ação:* `Adapter Pattern` ou unificação de interfaces.

### 3. Change Preventers (Dificultadores de Mudança)
- **Divergent Change:** Uma classe precisa mudar por múltiplos motivos diferentes. -> *Ação:* Separe responsabilidades em classes dedicadas (SRP).
- **Shotgun Surgery:** Uma única alteração de regra exige tocar em múltiplos arquivos e classes. -> *Ação:* `Move Method`, `Move Field` para consolidar o conceito.

### 4. Dispensables (Descartáveis)
- **Duplicate Code:** Lógica repetida em múltiplos locais. -> *Ação:* `Extract Method`, `Pull Up Method`.
- **Dead Code:** Variáveis, imports ou funções não utilizadas. -> *Ação:* Remoção limpa imediata.
- **Speculative Generality:** Código genérico construído "para o caso de precisarmos no futuro". -> *Ação:* Remover abstrações desnecessárias (YAGNI).
- **Comments as Deodorant:** Comentários explicando código confuso. -> *Ação:* Refatorar nomes de variáveis/métodos para torná-los autoexplicativos.

### 5. Couplers (Acopladores)
- **Feature Envy:** Método que usa mais dados de outra classe do que da sua própria. -> *Ação:* `Move Method`.
- **Inappropriate Intimacy:** Classes que conhecem detalhes internos privados demais de outras. -> *Ação:* Encapsular via Facade ou Interfaces públicas.

---

## 🎯 Design Patterns Aplicados a TypeScript & Angular Moderno

| Categoria | Padrão | Cenário de Uso no Angular |
| :--- | :--- | :--- |
| **Criacional** | **Factory Method** | Criação dinâmica de estratégias de validação ou de tipos de chaves Pix (CPF, CNPJ, Email, Telefone). |
| **Estrutural** | **Adapter** | Converter respostas de APIs externas para os modelos de Domínio da aplicação frontend. |
| **Estrutural** | **Facade** | Unificar o acesso a SignalStores, APIs HTTP e regras de negócio para os componentes visuais. |
| **Comportamental**| **Strategy** | Algoritmos intercambiáveis de formatação e validação sem quebrar o código cliente. |
| **Comportamental**| **Observer / Signals** | Reatividade nativa do Angular usando `signal()`, `computed()` e `effect()` para refletir mudanças de estado. |

---

## 🔄 Fluxo de Resposta ao Refatorar
1. **Diagnóstico:** Aponte o trecho do código e cite o nome do *Code Smell*.
2. **Técnica Selecionada:** Indique a técnica do catálogo (ex: `Extract Method`, `Replace Conditional with Strategy`).
3. **Código Refatorado:** Apresente o código limpo, tipado estritamente e documentado.
4. **Benefício / Trade-off:** Explique em 1 parágrafo como a alteração melhorou a manutenibilidade e legibilidade.
