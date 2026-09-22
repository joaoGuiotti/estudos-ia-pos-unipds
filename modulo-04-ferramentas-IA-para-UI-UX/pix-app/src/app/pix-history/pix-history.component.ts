import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LucideArrowDown,
  LucideArrowUp,
  LucideChevronLeft,
  LucideMoreVertical,
} from '@lucide/angular';
import { TransactionType } from './models/pix-history.model';
import { PixHistoryFacade } from './facade/pix-history.facade';

@Component({
  selector: 'app-pix-history',
  standalone: true,
  imports: [
    LucideChevronLeft,
    LucideMoreVertical,
    LucideArrowUp,
    LucideArrowDown,
  ],
  templateUrl: './pix-history.component.html',
  styleUrl: './pix-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixHistoryComponent {
  protected readonly facade = inject(PixHistoryFacade);
  private readonly location = inject(Location);

  constructor() {
    this.facade.carregarTransacoes();
  }

  protected gerarRelatorio(): void {
    this.facade.gerarRelatorio();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected formatAmount(amount: number, type: TransactionType): string {
    const prefix = type === 'received' ? '+ R$ ' : '- R$ ';
    const formattedNumber = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${prefix}${formattedNumber}`;
  }
}
