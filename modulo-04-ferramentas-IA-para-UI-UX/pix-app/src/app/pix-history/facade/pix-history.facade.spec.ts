import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Transaction } from '../models/pix-history.model';
import { PixHistoryBaseService } from '../services/pix-history-base.service';
import { PixHistoryService } from '../services/pix-history.service';
import { PixHistoryStore } from '../store/pix-history.store';
import { PixHistoryFacade } from './pix-history.facade';

/**
 * Implementação mock alternativa para demonstrar o Princípio de Substituição de Liskov (LSP).
 * Pode substituir PixHistoryService de forma transparente para qualquer consumidor.
 */
@Injectable()
class MockPixHistoryService extends PixHistoryBaseService {
  async carregarTransacoes(): Promise<Transaction[]> {
    return [
      {
        id: 'mock-tx-1',
        title: 'Mock - Pix recebido',
        amount: 100.0,
        type: 'received',
        date: '01 de Janeiro, 10:00',
        category: 'transfer',
      },
    ];
  }

  async solicitarRelatorio(): Promise<boolean> {
    return true;
  }
}

describe('PixHistoryFacade with PixHistoryService (Default Provider)', () => {
  let facade: PixHistoryFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PixHistoryFacade,
        PixHistoryStore,
        { provide: PixHistoryBaseService, useClass: PixHistoryService },
      ],
    });
    facade = TestBed.inject(PixHistoryFacade);
  });

  it('should initialize with empty transactions and idle status', () => {
    expect(facade.transactions()).toEqual([]);
    expect(facade.status()).toBe('idle');
    expect(facade.totalTransacoes()).toBe(0);
  });

  it('should load transactions successfully', async () => {
    await facade.carregarTransacoes();

    expect(facade.isLoaded()).toBe(true);
    expect(facade.transactions().length).toBe(4);
    expect(facade.totalTransacoes()).toBe(4);
  });

  it('should set relatorioSolicitado on gerarRelatorio', async () => {
    await facade.gerarRelatorio();

    expect(facade.relatorioSolicitado()).toBe(true);
  });
});

describe('PixHistoryFacade with Liskov Substitution (MockPixHistoryService)', () => {
  let facade: PixHistoryFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PixHistoryFacade,
        PixHistoryStore,
        // Substituição de Liskov: trocamos a implementação sem alterar a facade
        { provide: PixHistoryBaseService, useClass: MockPixHistoryService },
      ],
    });
    facade = TestBed.inject(PixHistoryFacade);
  });

  it('should accept MockPixHistoryService seamlessly without facade modifications', async () => {
    await facade.carregarTransacoes();

    expect(facade.isLoaded()).toBe(true);
    expect(facade.transactions().length).toBe(1);
    expect(facade.transactions()[0].id).toBe('mock-tx-1');
  });
});
