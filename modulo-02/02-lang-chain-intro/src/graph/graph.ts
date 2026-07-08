import {
    END,
    MessagesZodMeta,
    START,
    StateGraph
} from '@langchain/langgraph';
import { withLangGraph } from '@langchain/langgraph/zod';
import { BaseMessage } from 'langchain';
import { z } from 'zod';
import { ChatResponseNode } from './nodes/chatResponse.ts';
import { fallbackNode } from './nodes/fallbackNode.ts';
import { identifyIntent } from './nodes/identifyIntent.ts';
import { lowerCaseNode } from './nodes/lowerCase.ts';
import { upperCaseNode } from './nodes/upperCase.ts';

const GraphState = z.object({
    messages: withLangGraph(
        z.custom<BaseMessage[]>(),
        MessagesZodMeta
    ),
    output: z.string(),
    command: z.enum(['uppercase', 'lowercase', 'unknown'])
});

export type GraphState = z.infer<typeof GraphState>;

export class BuildGraph {
    private workflow = new StateGraph({
        stateSchema: GraphState,
    })

    static build() {
        return new BuildGraph().workflow
            .addNode('identifyIntent', identifyIntent)
            .addNode('chatresponse', ChatResponseNode)

            .addNode('uppercase', upperCaseNode)
            .addNode('lowercase', lowerCaseNode)
            .addNode('fallback', fallbackNode)

            .addEdge(START, "identifyIntent")

            .addConditionalEdges(
                'identifyIntent',
                (state: GraphState) => {
                    switch (state.command) {
                        case 'uppercase':
                            return 'uppercase';
                        case 'lowercase':
                            return 'lowercase';
                        default:
                            return 'fallback';
                    }
                },
                {
                    'uppercase': 'uppercase',
                    'lowercase': 'lowercase',
                    'fallback': 'fallback'
                }
            )

            .addEdge('uppercase', 'chatresponse')
            .addEdge('lowercase', 'chatresponse')
            .addEdge('fallback', 'chatresponse')

            .addEdge('chatresponse', END)

            .compile();
    }
}

