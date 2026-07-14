import type { Runtime } from '@langchain/langgraph';
import { AIMessage, HumanMessage } from 'langchain';
import { config } from '../../config.ts';
import { ChatResponseSchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/chatResponse.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import { PreferencesService } from '../../services/preferencesService.ts';
import type { GraphState } from '../graph.ts';
import { getUserId } from '../utils/getUserId.ts';
import { getMessageRole } from '../utils/getMessageRole.ts';

export function createChatNode(llmClient: OpenRouterService, preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    const userId = getUserId(state, runtime);

    const userContext = state.userContext ?? (await preferencesService.getBasicInfo(userId));
    const systemPrompt = getSystemPrompt(userContext);

    const conversationHistory = state.messages
      .map((msg) => `${getMessageRole(msg)}: ${msg.content}`)
      .join('\n');

    const userMessage = state.messages.at(-1)?.text ?? '';
    const userPrompt = getUserPromptTemplate(userMessage, conversationHistory);

    const result = await llmClient.generateStructured(
      systemPrompt,
      userPrompt,
      ChatResponseSchema
    );

    if (!result.success || !result.data) {
      console.error('❌ Erro ao gerar resposta do chat:', result.error);
      return {
        messages: [
          new AIMessage('Desculpe, encontrei um erro. Pode tentar novamente?')
        ]
      }
    }

    const data = result.data;

    // Calculate if sumarization is needed based on totla messages count
    // After sumarization, we keep 2 messages (user + AI)
    // So we trigger sumarization when we have 6+ messages
    // This gives: initial 2 + 4 new messages = 6 messages total
    const totalMessages = state.messages.length;
    const needsSummarization = totalMessages >= config.maxMessagesForSummarization;

    return {
      messages: [
        new AIMessage(data.message)
      ],
      extractedPreferences: data.shouldSavePreferences ? data.preferences : undefined,
      needsSummarization,
    };
  };
}
