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

            const systemPrompt = await template.format({
                USER_ROLE: state.user.role,
                USER_NAME: state.user.displayName,
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
