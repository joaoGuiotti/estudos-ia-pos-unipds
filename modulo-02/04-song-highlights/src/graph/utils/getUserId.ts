import type { Runtime } from '@langchain/langgraph';
import type { GraphState } from '../graph.ts';

/**
 * Extrai o ID do usuário de forma segura e consistente, 
 * seja a partir do contexto de execução (runtime) ou do estado do grafo.
 * 
 * Segue os princípios de:
 * - DRY (Don't Repeat Yourself): Centraliza a lógica de extração.
 * - Single Responsibility Principle (SOLID): Apenas uma responsabilidade, que é determinar o ID do usuário.
 */
export function getUserId(state: GraphState, runtime?: Runtime): string {
  return String(runtime?.context?.userId || state.userId || 'unknown');
}
