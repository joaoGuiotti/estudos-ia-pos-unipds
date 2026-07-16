import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';

export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {
            const lastMessages = state.messages.at(-1);
            const userInput = lastMessages?.text ?? '';

            const template = PromptTemplate.fromTemplate(prompts.system);
            
            const user = state.user ?? { role: 'member', displayName: 'Ana Neri', permissions: [], username: 'ananeri' };

            const systemPrompt = await template.format({
                USER_ROLE: user.role,
                USER_NAME: user.displayName,
            });

            const msg = systemPrompt.concat('\n', userInput);

            const result = await openRouterService.checkGuardRails(
                msg,
                state.guardrailsEnabled
            );

            console.log(`✅ Guardrails check result: ${JSON.stringify(result)}`);

            return {
                guardrailCheck: result,
            };
        } catch (error) {
            console.error('❌ Guardrails check failed:', error);

            return {
                guardrailCheck: {
                    safe: false,
                    reason: 'Guardrails service unavailable - request blocked for safety',
                }
            };
        }
    }
}
