import { Injectable, computed, signal } from '@angular/core';
import { HistoryState, Transaction } from '../models/pix-history.model';

@Injectable({
  providedIn: 'root',
})
export class PixHistoryStore {
  private readonly _state = signal<HistoryState>({
    transactions: [],
    status: 'idle',
    relatorioSolicitado: false,
  });

  // Selectors reativos derivados
  readonly transactions = computed(() => this._state().transactions);
  readonly status = computed(() => this._state().status);
  readonly isLoading = computed(() => this._state().status === 'loading');
  readonly isLoaded = computed(() => this._state().status === 'loaded');
  readonly isError = computed(() => this._state().status === 'error');
  readonly relatorioSolicitado = computed(() => this._state().relatorioSolicitado);
  readonly totalTransacoes = computed(() => this._state().transactions.length);

  iniciarCarregamento(): void {
    this._state.update((state) => ({
      ...state,
      status: 'loading',
    }));
  }

  carregamentoSucesso(transactions: Transaction[]): void {
    this._state.update((state) => ({
      ...state,
      transactions,
      status: 'loaded',
    }));
  }

  carregamentoFalha(): void {
    this._state.update((state) => ({
      ...state,
      status: 'error',
    }));
  }

  marcarRelatorioSolicitado(): void {
    this._state.update((state) => ({
      ...state,
      relatorioSolicitado: true,
    }));
  }

  resetarRelatorio(): void {
    this._state.update((state) => ({
      ...state,
      relatorioSolicitado: false,
    }));
  }
}
