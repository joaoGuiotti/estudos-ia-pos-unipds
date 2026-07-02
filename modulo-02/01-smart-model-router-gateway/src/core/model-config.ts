import { env } from "@env";


export type ModelConfig = {
    apiKey: string;
    httpReferer: string;
    xTitle: string;
    models: string[];
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    provider: { sort: { by: string, partition: string }, };
}

export const modelConfig = Object.freeze({
    apiKey: env.OPENROUTER_KEY,
    httpReferer: 'http://pos-ia.com',
    xTitle: 'Smart Model Router Gateway',
    models: [
        // 'cohere/north-mini-code:free',
        'google/gemma-4-31b-it:free',
        'poolside/laguna-xs.2:free'
        // 'alibaba/happyhorse-1.1',
    ],
    temperature: 0.2,
    maxTokens: 100,
    systemPrompt: 'you are a helpful assistant',
    provider: {
        sort: {
            by: 'price',
            // by: 'latency',
            // by: 'price',
            partition: 'none'
        }
    }
} as ModelConfig)