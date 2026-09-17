import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { PixTransferFormComponent } from './components/pix-transfer-form/pix-transfer-form.component';
import { PixFacade } from './facade/pix.facade';
import { PixTransferData } from './models/pix.model';

@Component({
  selector: 'app-pix-transfer',
  imports: [PixTransferFormComponent, CurrencyPipe],
  templateUrl: './pix-transfer.component.html',
  styleUrl: './pix-transfer.component.scss',
  host: {
    '(window:keydown.escape)': 'onKeydownEscape($event)',
  },
})
export class PixTransferComponent {
  protected readonly facade = inject(PixFacade);
  private readonly feedbackAlert = viewChild<ElementRef<HTMLElement>>('feedbackAlert');
  private lastActiveElement: HTMLElement | null = null;

  async onTransferir(dados: PixTransferData): Promise<void> {
    this.lastActiveElement = typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;
    await this.facade.executarTransferencia(dados);
    setTimeout(() => {
      this.feedbackAlert()?.nativeElement.focus();
    }, 50);
  }

  fecharFeedback(): void {
    this.facade.limparFeedback();
    // Restaura o foco para o elemento anterior garantindo navegação contínua por teclado
    if (this.lastActiveElement && typeof this.lastActiveElement.focus === 'function') {
      this.lastActiveElement.focus();
    }
  }

  protected onKeydownEscape(event?: Event): void {
    if (this.facade.isError() || this.facade.isSuccess()) {
      event?.preventDefault();
      this.fecharFeedback();
    }
  }
}

