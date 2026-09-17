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
    '(window:keydown.escape)': 'fecharFeedback()',
  },
})
export class PixTransferComponent {
  protected readonly facade = inject(PixFacade);
  private readonly feedbackAlert = viewChild<ElementRef<HTMLElement>>('feedbackAlert');

  async onTransferir(dados: PixTransferData): Promise<void> {
    await this.facade.executarTransferencia(dados);
    setTimeout(() => {
      this.feedbackAlert()?.nativeElement.focus();
    }, 50);
  }

  fecharFeedback(): void {
    this.facade.limparFeedback();
  }
}

