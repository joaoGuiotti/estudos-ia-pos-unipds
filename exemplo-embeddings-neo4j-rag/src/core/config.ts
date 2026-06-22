import type { PretrainedOptions } from "@huggingface/transformers";
import { readFileSync } from "node:fs";

export interface TextSplitterConfig {
    chunkSize: number;
    chunkOverlap: number;
}

const promptsFiles = {
    answerPrompt: JSON.parse(readFileSync('./prompts/answer-prompt.json', 'utf-8')),
    template: readFileSync('./prompts/template.txt', 'utf-8'),
}

export const CONFIG = Object.freeze({
    promptsFiles,
    neo4j: {
        url: process.env.NEO4J_URI!,
        username: process.env.NEO4J_USER!,
        password: process.env.NEO4J_PASSWORD!,
        indexName: "tensors_index",
        searchType: "vector" as const,
        textNodeProperties: ["text"],
        nodeLabel: "Chunk",
    },
    openRouter: {
        model: process.env.NLP_MODEL!,
        apiKey: process.env.OPENROUTER_KEY!,
        apiUrl: process.env.OPENROUTER_API_URL!,
        siteName: process.env.OPENROUTER_SITE_NAME!,
        siteUrl: process.env.OPENROUTER_SITE_URL!,
        temperature: 0.3,
        maxRetries: 2,
        defaultHeaders: {
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL!,
            "X-Title": process.env.OPENROUTER_SITE_NAME!
        }
    },
    pdf: {
        path: './tensores.pdf'
    },
    textSplitter: {
        chunkSize: 1000,
        chunkOverlap: 200,
    },
    embeddings: {
        model: process.env.EMBEDDINGS_MODEL!,
        pretrainedOptions: {
            dtype: 'fp32'
        } as PretrainedOptions,
    },
    similarity: {
        topK: 3,
    },
    output: {
        answersFolder: './outputs/answers',
        fileName: 'answer'
    }
})