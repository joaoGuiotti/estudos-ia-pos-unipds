import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PixReceipt, PixTransferData } from '../models/pix.model';
import { PixBaseService } from '../services/pix-base.service';
import { PixService } from '../services/pix.service';
import { PixStore } from '../store/pix.store';
import { PixFacade } from './pix.facade';

/**
 * Implementação mock alternativa para demonstrar o Princípio de Substituição de Liskov (LSP).
 * Pode substituir PixService de forma transparente para qualquer consumidor.
 */
@Injectable()
class MockCustomPixService extends PixBaseService {
  async processarTransferencia(dados: PixTransferData): Promise<PixReceipt> {
    return {
      id: 'MOCK-PIX-12345',
      chave: dados.chave,
      valor: dados.valor ?? 0,
      dataAgendamento: dados.data,
      dataCriacao: '2026-09-16T10:00:00.000Z',
      autenticacao: 'MOCK-AUTH-OK',
    };
  }
}

describe('PixFacade with PixSimulationService (Default Provider)', () => {
  let facade: PixFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PixFacade,
        PixStore,
        { provide: PixBaseService, useClass: PixService },
      ],
    });
    facade = TestBed.inject(PixFacade);
  });

  it('should initialize with default balance and idle status', () => {
    expect(facade.saldo()).toBe(5420.5);
    expect(facade.status()).toBe('idle');
  });

  it('should reject transfer when amount exceeds balance', async () => {
    const success = await facade.executarTransferencia({
      chave: 'test@email.com',
      valor: 999999,
      data: '2026-09-16',
    });

    expect(success).toBe(false);
    expect(facade.isError()).toBe(true);
    expect(facade.mensagemErro()).toContain('Saldo insuficiente');
  });

  it('should complete transfer successfully when amount is valid', async () => {
    const initialBalance = facade.saldo();
    const success = await facade.executarTransferencia({
      chave: 'usuario@banco.com',
      valor: 100,
      data: '2026-09-16',
    });

    expect(success).toBe(true);
    expect(facade.isSuccess()).toBe(true);
    expect(facade.saldo()).toBe(initialBalance - 100);
    expect(facade.ultimoRecibo()).toBeTruthy();
    expect(facade.ultimoRecibo()?.valor).toBe(100);
  });
});

describe('PixFacade with Liskov Substitution (MockCustomPixService)', () => {
  let facade: PixFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PixFacade,
        PixStore,
        // Substituição de Liskov: trocamos a implementação sem alterar a facade
        { provide: PixBaseService, useClass: MockCustomPixService },
      ],
    });
    facade = TestBed.inject(PixFacade);
  });

  it('should accept MockCustomPixService seamlessly without facade modifications', async () => {
    const success = await facade.executarTransferencia({
      chave: 'custom@lsp.com',
      valor: 50,
      data: '2026-09-16',
    });

    expect(success).toBe(true);
    expect(facade.isSuccess()).toBe(true);
    expect(facade.ultimoRecibo()?.id).toBe('MOCK-PIX-12345');
    expect(facade.ultimoRecibo()?.autenticacao).toBe('MOCK-AUTH-OK');
  });
});
