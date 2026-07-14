import { createIdentifyIntentNode } from './graph/nodes/identifyIntentNode.ts';
import { OpenRouterService } from './services/openRouterService.ts';
import { professionals } from './services/appointmentService.ts';

async function main() {
    const llmClient = new OpenRouterService();
    const node = createIdentifyIntentNode(llmClient, professionals);
    
    // Using HumanMessage from langchain
    const { HumanMessage } = require('@langchain/core/messages');

    const state = {
        messages: [new HumanMessage('Olá quero uma consulta com a Dra. Ana para amnhã as 10h')],
        intent: null,
        patientName: null,
        professionalId: null,
        professionalName: null,
        datetime: null,
        reason: null,
    } as any;
    
    const result = await node(state);
    console.log(JSON.stringify(result, null, 2));
}
main();
