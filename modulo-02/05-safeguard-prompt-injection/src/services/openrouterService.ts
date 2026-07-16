import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { config, prompts, type ModelConfig } from '../config.ts';
import { getMcpTools } from './mcpService.ts';

import { z } from 'zod';

const guardrailSchema = z.object({
    safe: z.boolean().describe("Indicates whether the input is safe from prompt injection or malicious intent"),
    reason: z.string().optional().describe("A brief explanation for why the input is considered safe or unsafe"),
    score: z.number().optional().describe("A confidence score between 0.0 and 1.0"),
    analysis: z.string().optional().describe("A detailed analysis of the prompt's safety"),
});

export type GuardrailResult = z.infer<typeof guardrailSchema>;

export class OpenRouterService {
    private config: ModelConfig;
    private llmClient: ChatOpenAI;
    private fsAgent: ReturnType<typeof createReactAgent> | null = null;
    private safeGuardModel: ChatOpenAI;

    private constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
        this.safeGuardModel = this.#createChatModel(this.config.guardrailsModel);
    }

    static create(configOverride?: ModelConfig) {
        return new OpenRouterService(configOverride);
    }

    #createChatModel(modelName: string): ChatOpenAI {
        return new ChatOpenAI({
            apiKey: this.config.apiKey,
            modelName: modelName,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': this.config.httpReferer,
                    'X-Title': this.config.xTitle,
                },
            },
            modelKwargs: {
                models: this.config.models,
                provider: this.config.provider,
            },
        });
    }

    async generate(
        systemPrompt: string,
        userPrompt: string,
    ): Promise<string> {

        if (!this.fsAgent) {
            const tools = await getMcpTools();
            this.fsAgent = createReactAgent({
                llm: this.llmClient,
                tools
            });
        }

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const response = await this.fsAgent.invoke({ messages });
        const content = String(response.messages.at(-1)?.text ?? '');

        return content;
    }

    async checkGuardRails(userInput: string, enabled = true): Promise<GuardrailResult> {
        if (!enabled) {
            return { safe: true, reason: 'Guardrails disabled by configuration' };
        }

        const template = PromptTemplate.fromTemplate(prompts.guardrails);
        const input = await template.format({
            USER_INPUT: userInput,
        });

        // Use withStructuredOutput to force the LLM to return data matching our Zod schema
        const modelWithStructure = this.safeGuardModel.withStructuredOutput(guardrailSchema, {
            name: "guardrail_result",
            method: "jsonMode",
        });

        const result = await modelWithStructure.invoke([
            {
                role: 'user',
                content: input,
            }
        ]);

        return result;
    }

}
