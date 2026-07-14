import type { BaseMessage } from '@langchain/core/messages';
import {
  END,
  MessagesZodMeta,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { z } from "zod/v3";
import { type MemoryService } from '../services/memorySumarization.ts';
import { OpenRouterService } from '../services/openrouterService.ts';
import { PreferencesService } from '../services/preferencesService.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { routeAfterChat, routeAfterSavePreferences } from './nodes/edgeConditions.ts';
import { createSavePreferencesNode } from './nodes/savePreferencesNode.ts';
import { createSummarizationNode } from './nodes/summarizationNode.ts';

const ChatStateAnnotation = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),
  userContext: z.string().optional(),
  extractedPreferences: z.any().optional(),
  needsSummarization: z.boolean().optional(),
  conversationSummary: z.any().optional(),
  userId: z.string().optional(),
});

export type GraphState = z.infer<typeof ChatStateAnnotation>;

export function buildChatGraph(
  llmClient: OpenRouterService,
  preferencesService: PreferencesService,
  memoryService: MemoryService
) {
  const graph = new StateGraph(ChatStateAnnotation)
    .addNode('chat', createChatNode(llmClient, preferencesService)) // Chat
    .addNode('savePreferences', createSavePreferencesNode(preferencesService)) // Save preferences
    .addNode('summarize', createSummarizationNode(llmClient, preferencesService)) // Summarize

    .addEdge(START, 'chat') // Start with chat

    .addConditionalEdges(
      'chat',
      routeAfterChat,
      {
        savePreferences: 'savePreferences',
        summarize: 'summarize',
        end: END,
      }
    ) // Route after chat

    .addConditionalEdges(
      'savePreferences',
      routeAfterSavePreferences,
      {
        summarize: 'summarize',
        end: END,
      }
    ) // Route after save preferences

    .addEdge('summarize', END); // Route after summarize

  return graph.compile({
    checkpointer: memoryService.checkPointer,
    store: memoryService.store,
  });
}
