import { HumanMessage, type BaseMessage } from '@langchain/core/messages';

/**
 * Identifica o papel (role) de uma mensagem no chat.
 * 
 * Segue os princípios de:
 * - DRY (Don't Repeat Yourself): Evita a repetição da verificação `HumanMessage.isInstance` nos nós.
 * - Single Responsibility Principle (SOLID): Única responsabilidade é determinar quem enviou a mensagem.
 */
export function getMessageRole(msg: BaseMessage): 'User' | 'AI' {
  return HumanMessage.isInstance(msg) ? 'User' : 'AI';
}
