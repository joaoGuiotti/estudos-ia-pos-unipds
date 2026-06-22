import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { CONFIG } from "../core/config.ts";

type DebugLog = (...args: unknown[]) => void;
type Params = {
    debugLog: DebugLog,
    vectorStore: Neo4jVectorStore,
    nlpModel?: ChatOpenAI,
    promptConfig?: typeof CONFIG.promptsFiles.answerPrompt,
    templateText?: typeof CONFIG.promptsFiles.template,
    topK?: number
}

interface IChainState {
    question: string;
    context?: string;
    topScore?: number;
    error?: string;
    answer?: string;
}

export class RagService {
    private params: Params;

    private constructor(params: Params) {
        this.params = params;
    }

    private async retrieveVectorSearchResults(input: IChainState): Promise<IChainState> {
        this.params.debugLog("🔍 Buscando no vector store do Neo4j...");
        const vectorResults = await this.params.vectorStore.similaritySearchWithScore(input.question, this.params.topK);

        if (!vectorResults.length) {
            this.params.debugLog("⚠️  Nenhum resultado encontrado no vector store.");
            return {
                ...input,
                error: "Desculpe, não encontrei informações relevantes sobre essa pergunta na base de conhecimento."
            };
        }

        const topScore = vectorResults[0]![1]
        this.params.debugLog(`✅ Encontrados ${vectorResults.length} resultados relevantes (melhor score: ${topScore.toFixed(3)})`);

        const contexts = vectorResults
            .filter(([, score]) => score > 0.5)
            .map(([doc]) => doc.pageContent)
            .join("\n\n---\n\n");

        return {
            ...input,
            context: contexts,
            topScore,
        }
    }

    private async generateNLPResponse(input: IChainState): Promise<IChainState> {
        if (input.error) return input
        this.params.debugLog("🤖 Gerando resposta com IA...");

        const responsePrompt = ChatPromptTemplate.fromTemplate(
            this.params.templateText!
        )
        const responseChain = responsePrompt
            .pipe(this.params.nlpModel!)
            .pipe(new StringOutputParser())

        const rawResponse = await responseChain.invoke({
            role: this.params.promptConfig.role,
            task: this.params.promptConfig.task,
            tone: this.params.promptConfig.constraints.tone,
            language: this.params.promptConfig.constraints.language,
            format: this.params.promptConfig.constraints.format,
            instructions: this.params.promptConfig.instructions.map((instruction: string, idx: number) =>
                `${idx + 1}. ${instruction}`
            ).join('\n'),
            question: input.question,
            context: input.context
        })

        return {
            ...input,
            answer: rawResponse,
        }
    }

    async answerQuestion(question: string) {
        const chain = RunnableSequence.from([
            this.retrieveVectorSearchResults.bind(this),
            this.generateNLPResponse.bind(this)
        ])

        const result = await chain.invoke({ question })

        this.params.debugLog("\n🎙️  Pergunta:");
        this.params.debugLog(question, "\n");
        this.params.debugLog("💬 Resposta:");
        this.params.debugLog(result.answer || result.error, "\n");

        return result;
    }

    static create(params: Params) {
        return new RagService({
            ...params,
            nlpModel: this.createNLPModel(),
            promptConfig: CONFIG.promptsFiles.answerPrompt,
            templateText: CONFIG.promptsFiles.template,
            topK: CONFIG.similarity.topK
        });
    }

    private static createNLPModel() {
        const nlpModel = new ChatOpenAI({
            temperature: CONFIG.openRouter.temperature,
            maxRetries: CONFIG.openRouter.maxRetries,
            model: CONFIG.openRouter.model,
            openAIApiKey: CONFIG.openRouter.apiKey,
            configuration: {
                baseURL: CONFIG.openRouter.apiUrl,
                defaultHeaders: CONFIG.openRouter.defaultHeaders
            }
        });
        return nlpModel;
    }
}