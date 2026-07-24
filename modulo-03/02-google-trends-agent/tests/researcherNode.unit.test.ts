import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HumanMessage } from '@langchain/core/messages';
import { createResearcherNode } from '../src/graph/nodes/researcherNode.ts';

describe('Researcher Node', () => {
    it('should extract text correctly when message content is an array', async () => {
        let passedQuestion = '';
        const mockOpenRouterService = {
            generateStructured: async (_sysPrompt: string, userQuestion: string) => {
                passedQuestion = userQuestion;
                return { data: { mock: 'data' } };
            }
        } as any;

        const node = createResearcherNode(mockOpenRouterService);

        // LangGraph Studio/API passes content as Array of content blocks
        const arrayMessage = new HumanMessage({
            content: [
                { type: 'text', text: 'Quais títulos você recomenda sobre Web AI?' }
            ]
        });

        const result = await node({
            messages: [arrayMessage]
        });

        assert.strictEqual(typeof result.question, 'string');
        assert.strictEqual(result.question, 'Quais títulos você recomenda sobre Web AI?');
        assert.strictEqual(passedQuestion, 'Quais títulos você recomenda sobre Web AI?');
    });

    it('should extract text correctly when message content is a string', async () => {
        const mockOpenRouterService = {
            generateStructured: async () => ({ data: { mock: 'data' } })
        } as any;

        const node = createResearcherNode(mockOpenRouterService);
        const stringMessage = new HumanMessage('Quais títulos você recomenda?');

        const result = await node({
            messages: [stringMessage]
        });

        assert.strictEqual(typeof result.question, 'string');
        assert.strictEqual(result.question, 'Quais títulos você recomenda?');
    });
});
