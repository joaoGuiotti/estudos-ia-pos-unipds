import { Injectable, inject } from '@angular/core';
import { PixTransferData } from '../models/pix.model';
import { PixBaseService } from '../services/pix-base.service';
import { PixStore } from '../store/pix.store';

@Injectable({
  providedIn: 'root',
})
export class PixFacade {
  private readonly store = inject(PixStore);
  private readonly service = inject(PixBaseService);

  // Exposição pública de Sinais Reativos
  readonly saldo = this.store.saldo;
  readonly status = this.store.status;
  readonly isLoading = this.store.isLoading;
  readonly isSuccess = this.store.isSuccess;
  readonly isError = this.store.isError;
  readonly ultimoRecibo = this.store.ultimoRecibo;
  readonly mensagemErro = this.store.mensagemErro;
  readonly historico = this.store.historico;

  /**
   * Coordena o fluxo de transferência, isolando regras de negócio e estado dos componentes.
   */
  async executarTransferencia(dados: PixTransferData): Promise<boolean> {
    if (dados.valor !== null && dados.valor > this.saldo()) {
      this.store.falhaTransferencia('Saldo insuficiente para realizar esta transferência.');
      return false;
    }

    this.store.iniciarTransferencia();

    try {
      const recibo = await this.service.processarTransferencia(dados);
      this.store.sucessoTransferencia(recibo);
      return true;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Falha ao processar transferência Pix.';
      this.store.falhaTransferencia(mensagem);
      return false;
    }
  }

  limparFeedback(): void {
    this.store.resetarStatus();
  }
}
