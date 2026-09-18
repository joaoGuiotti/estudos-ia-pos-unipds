import { Injectable } from '@angular/core';
import { Transaction } from '../models/pix-history.model';
import { PixHistoryBaseService } from './pix-history-base.service';

/**
 * Implementação concreta de simulação para o histórico Pix.
 * Respeita estritamente o contrato de PixHistoryBaseService (Liskov Substitution Principle).
 */
@Injectable({
  providedIn: 'root',
})
export class PixHistoryService extends PixHistoryBaseService {
  async carregarTransacoes(): Promise<Transaction[]> {
    // Simulação de latência de rede bancária
    await new Promise((resolve) => setTimeout(resolve, 400));

    return [
      {
        id: 'tx-1',
        title: 'Pix recebido - Erick S.',
        amount: 500.0,
        type: 'received',
        date: '14 de Março, 14:30',
        category: 'transfer',
      },
      {
        id: 'tx-2',
        title: 'Transferência enviada - Pagamentos S/A',
        amount: 150.0,
        type: 'sent',
        date: '13 de Março, 09:15',
        category: 'transfer',
      },
      {
        id: 'tx-3',
        title: 'Pix recebido - Loja Central',
        amount: 1250.0,
        type: 'received',
        date: '12 de Março, 18:45',
        category: 'transfer',
      },
      {
        id: 'tx-4',
        title: 'Pagamento efetuado - QR Code',
        amount: 42.9,
        type: 'sent',
        date: '12 de Março, 10:20',
        category: 'qr-code',
      },
    ];
  }

  async solicitarRelatorio(): Promise<boolean> {
    // Simulação de processamento do relatório
    await new Promise((resolve) => setTimeout(resolve, 600));
    return true;
  }
}
