import { Injectable, computed, signal } from '@angular/core';
import { PixReceipt, PixState } from '../models/pix.model';

@Injectable({
  providedIn: 'root',
})
export class PixStore {
  private readonly _state = signal<PixState>({
    saldo: 5420.5,
    status: 'idle',
    ultimoRecibo: null,
    mensagemErro: null,
    historico: [],
  });

  // Selectors reativos derivados
  readonly saldo = computed(() => this._state().saldo);
  readonly status = computed(() => this._state().status);
  readonly isLoading = computed(() => this._state().status === 'loading');
  readonly isSuccess = computed(() => this._state().status === 'success');
  readonly isError = computed(() => this._state().status === 'error');
  readonly ultimoRecibo = computed(() => this._state().ultimoRecibo);
  readonly mensagemErro = computed(() => this._state().mensagemErro);
  readonly historico = computed(() => this._state().historico);

  iniciarTransferencia(): void {
    this._state.update((state) => ({
      ...state,
      status: 'loading',
      mensagemErro: null,
    }));
  }

  sucessoTransferencia(recibo: PixReceipt): void {
    this._state.update((state) => ({
      ...state,
      saldo: state.saldo - recibo.valor,
      status: 'success',
      ultimoRecibo: recibo,
      mensagemErro: null,
      historico: [recibo, ...state.historico],
    }));
  }

  falhaTransferencia(mensagem: string): void {
    this._state.update((state) => ({
      ...state,
      status: 'error',
      mensagemErro: mensagem,
    }));
  }

  resetarStatus(): void {
    this._state.update((state) => ({
      ...state,
      status: 'idle',
      mensagemErro: null,
    }));
  }
}
