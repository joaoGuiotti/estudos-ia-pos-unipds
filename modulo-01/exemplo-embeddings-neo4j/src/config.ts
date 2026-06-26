import type { PretrainedOptions } from "@huggingface/transformers";

export interface TextSplitterConfig {
    chunkSize: number;
    chunkOverlap: number;
}

export const CONFIG = Object.freeze({
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
        nlpModel: process.env.NLP_MODEL!,
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
    }
})