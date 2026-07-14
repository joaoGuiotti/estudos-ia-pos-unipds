import { AIMessage } from 'langchain';
import { getSystemPrompt, getUserPromptTemplate, MessageSchema } from '../../prompts/v1/messageGenerator.ts';
import type { IUserPromptDetail } from '../../prompts/v1/messageGenerator.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';

export function createMessageGeneratorNode(llmClientService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log(`💬 Generating response message...`);
        try {
            const hasSucceeded = state.actionSuccess ? 'success' : 'error';
            const scenario = `${state.intent ?? 'unknown'}_${hasSucceeded}`;
            const details: IUserPromptDetail = {
                professionalName: state.professionalName || undefined,
                datetime: state.datetime || undefined,
                patientName: state.patientName || undefined,
                error: state.actionError || state.error || undefined,
            };

            const systemPrompt = getSystemPrompt();
            const userPrompt = getUserPromptTemplate({ scenario, details });

            const result = await llmClientService.generateStructured(
                systemPrompt,
                userPrompt,
                MessageSchema
            );

            if (result.error) {
                console.log("❌ Error generating message:", result.error);
                return {
                    messages: [
                        ...state.messages,
                        new AIMessage('Desculpe, errei!!.')
                    ],
                }
            }

            return {
                messages: [
                    ...state.messages,
                    new AIMessage(result.data!.message)
                ],
            };
        } catch (error) {
            console.error('❌ Error in messageGenerator node:', error);
            return {
                messages: [
                    ...state.messages,
                    new AIMessage('An error occurred while processing your request.')
                ],
            };
        }
    };
}
