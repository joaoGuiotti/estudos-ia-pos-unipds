export type ModelConfig = {
  providerType: 'openrouter' | 'ollama';
  ollamaBaseUrl: string;
  ollamaModel: string;
  apiKey: string;
  httpReferer: string;
  xTitle: string;

  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };

  models: string[];
  temperature: number;
  maxTokens: number;
};

const providerType = (process.env.LLM_PROVIDER as 'openrouter' | 'ollama') || 'openrouter';

if (providerType === 'openrouter') {
  console.assert(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set in environment variables');
}

export const config: ModelConfig = {
  providerType,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
  apiKey: process.env.OPENROUTER_API_KEY || 'ollama',
  httpReferer: '',
  xTitle: 'IA Devs - Transforming Services into Tools',
  models: [
    'qwen/qwen-2.5-7b-instruct',// unsafe!
    'poolside/laguna-s-2.1:free'
  ],
  provider: {
    sort: {
      by: 'throughput',
      partition: 'none',
    },
  },
  temperature: 0.7,
  maxTokens: 2048,
};
