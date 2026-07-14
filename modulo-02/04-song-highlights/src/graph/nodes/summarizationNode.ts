import { RemoveMessage } from '@langchain/core/messages';
import type { Runtime } from '@langchain/langgraph';
import { HumanMessage } from 'langchain';
import { getSummarizationSystemPrompt, getSummarizationUserPrompt, SummarySchema } from '../../prompts/v1/summarization.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import { PreferencesService } from '../../services/preferencesService.ts';
import type { GraphState } from '../graph.ts';
import { getUserId } from '../utils/getUserId.ts';
import { getMessageRole } from '../utils/getMessageRole.ts';

export function createSummarizationNode(llmClient: OpenRouterService, preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {

    const conversationHistory = state.messages.map((msg) => ({
      role: getMessageRole(msg),
      content: msg.text,
    }));

    const previousSummary = state.conversationSummary;
    const systemPrompt = getSummarizationSystemPrompt();
    const userPrompt = getSummarizationUserPrompt(conversationHistory, previousSummary);

    const response = await llmClient.generateStructured(
      systemPrompt,
      userPrompt,
      SummarySchema,
    );

    if (response.error || !response.data) {
      console.log('❌ Erro ao gerar sumarização:', response.error);
      return {
        needsSummarization: true,
      };
    }

    const userId = getUserId(state, runtime);

    await preferencesService.storeSummary(
      userId,
      response.data,
    );

    const deleteMessages = state.messages.slice(0, -2)
      .map((msg) => new RemoveMessage({ id: msg.id! }))

    return {
      messages: deleteMessages,
      conversationSummary: response.data,
      needsSummarization: false,
    };
  };
}
