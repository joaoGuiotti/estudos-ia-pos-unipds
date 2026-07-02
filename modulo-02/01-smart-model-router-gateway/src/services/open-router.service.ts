import { OpenRouter } from '@openrouter/sdk';
import { modelConfig, ModelConfig } from 'src/core/model-config.ts';

export type LlmReposnse = {
    model: string;
    content: string;
}

export class OpenRouterService {
    client: OpenRouter;
    config!: ModelConfig;

    constructor(configOverride: ModelConfig) {
        this.config = configOverride ?? modelConfig;

        this.client = new OpenRouter({
            apiKey: this.config.apiKey,
            httpReferer: this.config.httpReferer,
            appTitle: this.config.xTitle,
        });
    }

    async generate(prompt: string): Promise<LlmReposnse> {
        const response = await this.client.chat.send({
            chatRequest: {
                models: this.config.models,
                messages: [
                    { role: 'system', content: this.config.systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                provider: this.config.provider,
            }
        })
        const content = response.choices.at(0)?.message.content ?? '';
        return {
            model: response.model,
            content,
        };
    }

}