import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { ChatGeneration } from '@langchain/core/outputs';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, providerStrategy } from 'langchain';
import { z } from 'zod/v3';
import { config, type ModelConfig } from '../config.ts';
import { MCPService } from './mcpService.ts';

export class OpenRouterService {
    private readonly mcpService = new MCPService();
    private config: ModelConfig;
    private llmClient: ChatOpenAI;

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
    }

    #createChatModel(modelName: string): ChatOpenAI {
        if (this.config.providerType === 'ollama') {
            console.log(`🦙 Initializing local Ollama model: ${this.config.ollamaModel} at ${this.config.ollamaBaseUrl}`);
            return new ChatOpenAI({
                apiKey: 'ollama',
                modelName: this.config.ollamaModel,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                configuration: {
                    baseURL: `${this.config.ollamaBaseUrl.replace(/\/$/, '')}/v1`,
                },
            });
        }

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

    // async generateStructured<T = string>(
    //     systemPrompt: string,
    //     userPrompt: string,
    //     schema?: z.ZodSchema<T>,
    // ): Promise<{ data?: T | string; }> {

    //     const messages = [
    //         new SystemMessage(systemPrompt),
    //         new HumanMessage(userPrompt),
    //     ];

    //     const callbacks = [{
    //         handleChatModelStart(_llm: unknown, promptMessages: unknown[][]) {
    //             const lastMsg = (promptMessages as any).at(-1)?.at(-1);
    //             console.log(`\n🧠 LLM thinking...`);
    //             console.log(` (last message: "${lastMsg?.content?.toString()}")`);
    //         },
    //         handleLLMEnd(output: any) {
    //             const msg = (output.generations?.at(0)?.at(0) as ChatGeneration)?.message as AIMessage;
    //             const toolCalls = msg?.tool_calls;
    //             if (toolCalls?.length) {
    //                 console.log(`🎯 Decided to call: ${toolCalls.map((t) => t.name).join(', ')}`);
    //             }
    //         },
    //         handleToolStart(_tool: unknown, input: unknown, _runId: string, _parentRunId: string, _tags: unknown, _metadata: unknown, runName?: string) {
    //             console.log(`🔧 Tool called: ${runName} →`, input);
    //         },
    //         handleToolEnd(output: unknown, _runId: string, _parentRunId?: string, _tags?: string[]) {
    //             console.log(`✅ Tool done:   →`, output);
    //         },
    //     }];

    //     // ── Schema path ──────────────────────────────────────────────────────────
    //     // Use .withStructuredOutput() instead of providerStrategy().
    //     // providerStrategy() uses grammar-based constrained decoding which is
    //     // rejected by many providers (e.g. Together AI: "grammar is not valid").
    //     // .withStructuredOutput() uses function-calling / JSON mode — broadly supported.
    //     if (schema) {
    //         const structuredLlm = this.llmClient.withStructuredOutput(schema, { method: 'jsonMode' });
    //         const result = await structuredLlm.invoke(messages, { callbacks });
    //         console.log('✅ Structured LLM Response:', JSON.stringify(result));
    //         return { data: result as T };
    //     }

    //     // ── Tool / agent path ─────────────────────────────────────────────────────
    //     const agent = createAgent({
    //         tools: await this.mcpService.getTools(),
    //         model: this.llmClient,
    //     });

    //     try {
    //         const data = await agent.invoke({ messages }, { callbacks });
    //         console.log('✅ LLM Response:', JSON.stringify(data));

    //         // Extract the last AI message with non-empty text content
    //         const aiMessages = (data.messages ?? []).filter(
    //             (m: any) => (m._getType?.() === 'ai' || m.type === 'ai') && typeof m.content === 'string' && m.content.trim().length > 0
    //         );
    //         const lastAiContent = aiMessages.at(-1)?.content as string;

    //         if (lastAiContent) {
    //             return { data: lastAiContent };
    //         }

    //         // Fallback: check if write_file succeeded in tool messages
    //         const writeToolMsg = (data.messages ?? []).find(
    //             (m: any) => m.name === 'write_file' && typeof m.content === 'string'
    //         );
    //         if (writeToolMsg) {
    //             return { data: 'Report generated and saved successfully to ./reports/' };
    //         }

    //         const fallbackContent = data.messages.at(-1)?.content;
    //         return {
    //             data: (typeof fallbackContent === 'string' && fallbackContent) || 'Task completed.',
    //         };
    //     } catch (error) {
    //         console.error('LLM execution error:', error);
    //         throw error;
    //     }
    // }

    async generateStructured<T>(
        systemPrompt: string,
        userPrompt: string,
        schema?: z.ZodSchema<T>,
    ): Promise<{ data?: T | string; }> {
        const agentConfig = schema
            ? { responseFormat: providerStrategy(schema), tools: [] }
            : { tools: await this.mcpService.getTools() };

        const agent = createAgent({
            ...agentConfig,
            model: this.llmClient,
        });

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const data = await agent.invoke(
            {
                messages
            },
            {
                callbacks: [{
                    handleChatModelStart(_llm, promptMessages) {
                        const lastMsg = promptMessages.at(-1)?.at(-1);
                        console.log(`\n🧠 LLM thinking...`);
                        console.log(` (last message: "${lastMsg?.content?.toString()}")`);
                    },
                    handleLLMEnd(output) {
                        const msg = (output.generations?.at(0)?.at(0) as ChatGeneration)?.message as AIMessage;
                        const toolCalls = msg?.tool_calls;
                        if (toolCalls?.length) {
                            console.log(`🎯 Decided to call: ${toolCalls.map((t) => t.name).join(', ')}`);
                        }
                    },
                    handleToolStart(_tool, input, _runId, _parentRunId, _tags, _metadata, runName) {
                        console.log(`🔧 Tool called: ${runName} →`, input);
                    },
                    handleToolEnd(output, _runId, _parentRunId, runName) {
                        console.log(`✅ Tool done:   ${runName} →`, output);
                    },
                }]
            });

        const lastAiContent = this.extractLastAIMessage(data);

        return {
            data: schema ? ((data as any).structuredResponse as T) : (lastAiContent || 'Report generated successfully.'),
        };
    }


    private extractLastAIMessage(data: any) {
        const aiMessages = (data.messages ?? []).filter(
            (m: any) => (m._getType?.() === 'ai' || m.type === 'ai') && typeof m.content === 'string' && m.content.trim().length > 0
        );
        const lastAiContent = aiMessages.at(-1)?.content as string;
        // Fallback caso a última mensagem seja uma ToolMessage
        const lastMsg = data.messages.at(-1);
        const content = lastAiContent || (typeof lastMsg?.content === 'string' ? lastMsg.content : '');
        return content;
    }
}
