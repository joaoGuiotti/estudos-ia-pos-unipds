import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';
import { getKeywordsSystemPrompt } from '../../prompts/v1/keywords.ts';

function extractText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object' && item !== null && 'text' in item && typeof (item as { text: unknown }).text === 'string') {
                    return (item as { text: string }).text;
                }
                return '';
            })
            .filter(Boolean)
            .join('\n');
    }
    return String(content ?? '');
}

export function createResearcherNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🔍 Researcher processing...');
        const lastMessage = state.messages.at(-1);
        const userQuestion = extractText(lastMessage?.content);
        try {

            const result = await openRouterService.generateStructured(
                getKeywordsSystemPrompt(),
                userQuestion,
            );

            console.log('📊 Trends data fetched via tool call');

            return {
                trendsData: JSON.stringify(result.data, null, 2),
                question: userQuestion,
            };

        } catch (error) {
            console.error('Researcher error:', error);
            return {
                trendsData: 'Sorry, something went wrong while fetching trends data.',
                question: userQuestion,
            };
        }
    };
}

