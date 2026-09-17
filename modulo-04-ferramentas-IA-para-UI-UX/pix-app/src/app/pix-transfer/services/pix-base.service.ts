import { Injectable } from '@angular/core';
import { PixReceipt, PixTransferData } from '../models/pix.model';

/**
 * Contrato abstrato para serviços de transferência Pix.
 *
 * Utiliza uma classe abstrata em vez de uma interface pura para preservar o identificador
 * de tipo em tempo de execução no JavaScript, servindo diretamente como Injection Token
 * no sistema de injeção de dependências do Angular.
 *
 * Princípio de Substituição de Liskov (LSP):
 * Qualquer subclasse concreta (ex.: PixSimulationService, PixHttpService, PixMockService)
 * deve cumprir as mesmas pré e pós-condições deste contrato, podendo substituir PixService
 * de forma transparente para os consumidores (ex.: PixFacade).
 */
@Injectable()
export abstract class PixBaseService {
  /**
   * Executa o processamento de uma transferência Pix.
   *
   * @param dados Dados validados da transferência Pix.
   * @returns Promessa com o recibo da transferência emitida.
   * @throws Error caso ocorra erro de validação ou recusa da transação.
   */
  abstract processarTransferencia(dados: PixTransferData): Promise<PixReceipt>;
}
