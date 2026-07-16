import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';

export const createChatNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {
            const lastMessage = state.messages.at(-1) ?? new HumanMessage('');
            const userPrompt = lastMessage.text;

            const template = PromptTemplate.fromTemplate(prompts.system);
            const user = state.user ?? { role: 'member', displayName: 'Ana Neri', permissions: [], username: 'ananeri' };
            const systemPrompt = await template.format({
                USER_ROLE: user.role,
                USER_NAME: user.displayName,
            });

            const response = await openRouterService.generate(
                systemPrompt,
                userPrompt
            );

            return {
                messages: [new AIMessage(response)],
            };
        } catch (error) {
            console.error('Chat node error:', error);
            return {
                messages: [new AIMessage('I apologize, but I encountered an error processing your request. Please try again later.')],
            };
        }
    }
}
