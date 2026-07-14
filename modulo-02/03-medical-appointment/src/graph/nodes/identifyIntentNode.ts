import { getSystemPrompt, getUserPromptTemplate, IntentSchema } from '../../prompts/v1/identifyIntent.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';

export function createIdentifyIntentNode(llmClient: OpenRouterService, professionals: any[]) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`🔍 Identifying intent...`);
    const conversationHistory = state.messages.map(m => {
      const mAny = m as any;
      const type = typeof m.getType === 'function' ? m.getType() : (mAny.type || mAny.role || 'human');
      const content = m.content || mAny.text || '';
      return `${type}: ${content}`;
    }).join('\n');

    try {
      const systemPrompt = getSystemPrompt(professionals);
      const userPrompt = getUserPromptTemplate(conversationHistory);
      const result = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        IntentSchema
      );

      if (!result.success) {
        return {
          error: result.error,
          intent: 'unknown',
        }
      }

      const intentData = result.data!;

      console.log(`✅ Intent identified: ${intentData.intent}`);
      console.log(`✅ Professional ID: ${intentData.professionalId}`);
      console.log(`✅ Professional name: ${intentData.professionalName}`);
      console.log(`✅ Datetime: ${intentData.datetime}`);
      console.log(`✅ Patient name: ${intentData.patientName}`);
      console.log(`✅ Reason: ${intentData.reason}`);

      return {
        ...state,
        ...intentData
      };
    } catch (error) {
      console.error('❌ Error in identifyIntent node:', error);
      return {
        intent: 'unknown',
        error: error instanceof Error ? error.message : 'Intent identification failed',
      };
    }
  };
}
