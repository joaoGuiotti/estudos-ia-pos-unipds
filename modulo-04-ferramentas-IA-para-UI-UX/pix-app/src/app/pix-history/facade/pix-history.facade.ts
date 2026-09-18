import { Injectable, inject } from '@angular/core';
import { PixHistoryBaseService } from '../services/pix-history-base.service';
import { PixHistoryStore } from '../store/pix-history.store';

@Injectable({
  providedIn: 'root',
})
export class PixHistoryFacade {
  private readonly store = inject(PixHistoryStore);
  private readonly service = inject(PixHistoryBaseService);

  // Exposição pública de Sinais Reativos
  readonly transactions = this.store.transactions;
  readonly status = this.store.status;
  readonly isLoading = this.store.isLoading;
  readonly isLoaded = this.store.isLoaded;
  readonly isError = this.store.isError;
  readonly relatorioSolicitado = this.store.relatorioSolicitado;
  readonly totalTransacoes = this.store.totalTransacoes;

  /**
   * Coordena o carregamento de transações, isolando regras de negócio e estado dos componentes.
   */
  async carregarTransacoes(): Promise<void> {
    this.store.iniciarCarregamento();

    try {
      const transactions = await this.service.carregarTransacoes();
      this.store.carregamentoSucesso(transactions);
    } catch {
      this.store.carregamentoFalha();
    }
  }

  /**
   * Solicita a geração de relatório com feedback temporário.
   */
  async gerarRelatorio(): Promise<void> {
    this.store.marcarRelatorioSolicitado();

    try {
      await this.service.solicitarRelatorio();
    } finally {
      setTimeout(() => {
        this.store.resetarRelatorio();
      }, 3000);
    }
  }
}
