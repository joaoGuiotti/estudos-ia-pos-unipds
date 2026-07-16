import { z } from 'zod/v3';
import { withLangGraph } from '@langchain/langgraph/zod';
import type { BaseMessage } from '@langchain/core/messages';
import { type User } from '../config.ts';
import type { GuardrailResult } from '../services/openrouterService.ts';
import { MessagesZodMeta } from '@langchain/langgraph';

export const SafeguardStateAnnotation = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),

  user: z.custom<User>().default({
    username: 'ananeri',
    role: 'member',
    permissions: [],
    displayName: 'Ana Neri'
  }),

  guardrailCheck: z.custom<GuardrailResult | null>().nullable().default(null),
  guardrailsEnabled: z.boolean().default(true),
});

export type GraphState = z.infer<typeof SafeguardStateAnnotation>;
