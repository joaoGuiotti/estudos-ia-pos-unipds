import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';
import type { GraphState } from '../state.ts';
import { AIMessage } from 'langchain';

export async function blockedNode(state: GraphState): Promise<Partial<GraphState>> {
  const guardrailCheck = state.guardrailCheck!;
  const analysis = guardrailCheck.analysis
    ? `**Analysis:** ${guardrailCheck.analysis}`
    : '';

  const user = state.user ?? { role: 'member', displayName: 'Ana Neri', permissions: [], username: 'ananeri' };
  const permissions = user.permissions?.join(', ') ?? 'None';
  const template = PromptTemplate.fromTemplate(prompts.blocked);
  const blockedMessage = await template.format({
    REASON: guardrailCheck.reason,
    ANALYSIS: analysis,
    USER_ROLE: user.role,
    PERMISSIONS: permissions,
  });

  return {
    messages: [new AIMessage(blockedMessage)],
  };
}
