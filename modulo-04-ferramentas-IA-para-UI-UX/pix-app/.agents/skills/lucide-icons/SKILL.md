---
name: lucide-icons
description: >-
  Use esta skill sempre que ícones forem necessários, adicionados, avaliados ou
  refatorados em templates HTML e componentes Angular (v21+). Define o uso
  exclusivo e obrigatório da biblioteca @lucide/angular com tree-shaking,
  tipagem estrita, Design Tokens e acessibilidade WCAG 2.2 / WAI-ARIA.
---

# ✨ Lucide Icons Skill (@lucide/angular)

Padronizar o ecossistema visual da aplicação garantindo o uso **exclusivo e obrigatório** da biblioteca **`@lucide/angular`**. Assegurar máxima performance através de *tree-shaking*, tipagem estrita, conformidade com os tokens de design do projeto e total acessibilidade.

## Instalação
```sh
npm install @lucide/angular
```

## Padrões de Uso no Angular Moderno

### 1. Ícones Standalone (Padrão Recomendado)
Cada ícone é um componente standalone individual com tree-shaking total.

**Convenções:**
- O nome importado usa **PascalCase** com prefixo `Lucide`: `LucideFileText`, `LucideArrowRight`.
- No template HTML, use `<svg>` com seletor em **camelCase**: `<svg lucideFileText></svg>`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideFileText, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-transaction-item',
  standalone: true,
  imports: [LucideFileText, LucideArrowRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="transaction-item">
      <svg lucideFileText [size]="20" class="icon-primary"></svg>
      <span>Comprovante</span>
      <svg lucideArrowRight [size]="16" [strokeWidth]="2"></svg>
    </div>
  `,
})
export class TransactionItemComponent {}
```

### 2. Ícone Dinâmico (`LucideDynamicIcon`)
Para alternar ícones dinamicamente (listas, estados, signals):

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideDynamicIcon, LucideCircleCheck, LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class.success]="isSuccess()">
      <svg [lucideIcon]="statusIcon()" [size]="18" [strokeWidth]="2"></svg>
      {{ isSuccess() ? 'Concluído' : 'Atenção' }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly isSuccess = signal<boolean>(true);
  readonly statusIcon = computed(() => (this.isSuccess() ? LucideCircleCheck : LucideCircleAlert));
}
```

## Propriedades e Inputs dos Ícones

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `size` | `number` | `24` | Dimensão do ícone (px). |
| `color` | `string` | `'currentColor'` | Cor do traço. |
| `strokeWidth` | `number` | `2` | Espessura da linha. |
| `nonScalingStroke` | `boolean` | `false` | Impede distorção em escalas SVG. |
| `title` | `string` | `null` | Título semântico (remove `aria-hidden`). |

### Exemplo com Design Tokens:
```html
<svg
  lucideLandmark
  [size]="24"
  [strokeWidth]="2"
  color="var(--color-primary)"
  class="brand-icon"
></svg>
```

## ♿ Acessibilidade (A11y) com Lucide

1. **Ícones Decorativos:** Quando acompanha texto visível, mantenha `aria-hidden="true"` (padrão).
2. **Botões Icon-Only:** O `aria-label` fica no `<button>`, o ícone permanece decorativo:
   ```html
   <button type="button" class="btn-icon" aria-label="Copiar código Pix" (click)="copiar()">
     <svg lucideCopy [size]="18" aria-hidden="true"></svg>
   </button>
   ```
3. **Ícones com Significado Próprio:** Forneça `[title]`:
   ```html
   <svg lucideCheckCircle [size]="20" title="Transação confirmada com sucesso"></svg>
   ```

## 🚫 Regras Rígidas & Anti-Patterns

1. ❌ **PROIBIDO** o uso de fontes de ícones (Material Symbols, FontAwesome, etc.).
2. ❌ **PROIBIDO** o uso de SVGs inline brutos/hardcoded quando houver ícone equivalente no Lucide.
3. ❌ **PROIBIDO** esquecer de declarar o componente no array `imports: [...]`.
4. ❌ **PROIBIDO** utilizar cores hexadecimais fixas no `color`. Use `currentColor` ou `var(--color-...)`.
