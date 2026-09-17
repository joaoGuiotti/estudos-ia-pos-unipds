import { Injectable } from '@angular/core';
import { PixReceipt, PixTransferData } from '../models/pix.model';
import { PixBaseService } from './pix-base.service';

/**
 * Implementação concreta de simulação para transferência Pix.
 * Respeita estritamente o contrato de PixService (Liskov Substitution Principle).
 */
@Injectable({
  providedIn: 'root',
})
export class PixService extends PixBaseService {
  async processarTransferencia(dados: PixTransferData): Promise<PixReceipt> {
    // Simulação de latência de rede bancária
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!dados.chave || !dados.valor || !dados.data) {
      throw new Error('Todos os campos da transferência são obrigatórios.');
    }

    if (dados.valor <= 0) {
      throw new Error('O valor da transferência deve ser maior que zero.');
    }

    const receipt: PixReceipt = {
      id: `PIX-${Date.now().toString(36).toUpperCase()}`,
      chave: dados.chave,
      valor: dados.valor,
      dataAgendamento: dados.data,
      dataCriacao: new Date().toISOString(),
      autenticacao: Math.random().toString(36).substring(2, 15).toUpperCase(),
    };

    return receipt;
  }
}
