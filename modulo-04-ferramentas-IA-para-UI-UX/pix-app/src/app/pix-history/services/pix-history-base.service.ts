import { Injectable } from '@angular/core';
import { Transaction } from '../models/pix-history.model';

/**
 * Contrato abstrato para serviços de histórico Pix.
 *
 * Utiliza uma classe abstrata em vez de uma interface pura para preservar o identificador
 * de tipo em tempo de execução no JavaScript, servindo diretamente como Injection Token
 * no sistema de injeção de dependências do Angular.
 *
 * Princípio de Substituição de Liskov (LSP):
 * Qualquer subclasse concreta (ex.: PixHistorySimulationService, PixHistoryHttpService)
 * deve cumprir as mesmas pré e pós-condições deste contrato, podendo substituir
 * PixHistoryBaseService de forma transparente para os consumidores (ex.: PixHistoryFacade).
 */
@Injectable()
export abstract class PixHistoryBaseService {
  /**
   * Carrega a lista de transações Pix recentes.
   *
   * @returns Promessa com a lista de transações.
   */
  abstract carregarTransacoes(): Promise<Transaction[]>;

  /**
   * Solicita a geração de um relatório de extrato.
   *
   * @returns Promessa indicando sucesso da solicitação.
   */
  abstract solicitarRelatorio(): Promise<boolean>;
}
