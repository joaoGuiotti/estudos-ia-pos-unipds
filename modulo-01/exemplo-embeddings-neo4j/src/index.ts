import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./document-processor.ts";
import { Utils } from "./utils.ts";

let _neo4jVectorStore: Neo4jVectorStore | null = null;

async function clearAll(vectorStore: Neo4jVectorStore, nodeLabeL: string) {
    console.log(`\n 🗑️  Apagando todos os documentos do banco de dados...`);
    await vectorStore.query(
        `MATCH (n: \`${nodeLabeL}\`) DETACH DELETE n`
    )
    console.log(`\n ✅ Documentos removidos com sucesso. \n`);
}

try {
    console.log('\n 🚀 Inicializando Sistema de Embeddings com Neo4j... \n');

    const documentProcessor = DocumentProcessor.create(
        CONFIG.pdf.path,
        CONFIG.textSplitter
    );

    const chunks = await documentProcessor.loadAndSplitDocument();

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embeddings.model,
        pretrainedOptions: CONFIG.embeddings.pretrainedOptions
    });

    console.log('Modelo carregado com sucesso');

    _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
        embeddings,
        CONFIG.neo4j
    );

    clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);

    for (const [index, chunk] of chunks.entries()) {
        console.log(` ✅ Adicionando documento:  ${index + 1}/${chunks.length}`);
        await _neo4jVectorStore.addDocuments([chunk]);
    }

    console.log('✅ Documentos adicionados com sucesso');

    console.log("🔍 ETAPA 2: Executando buscas por similaridade...\n");
    const questions = [
        "O que são tensores e como são representados em JavaScript?",
        "Como converter objetos JavaScript em tensores?",
        "O que é normalização de dados e por que é necessária?",
        "Como funciona uma rede neural no TensorFlow.js?",
        "O que significa treinar uma rede neural?",
        "o que é hot enconding e quando usar?"
    ];

    for (const question of questions) {
        Utils.printDivider();
        console.log(`❓ Pergunta: ${question}`);
        Utils.printDivider();

        const results = await _neo4jVectorStore.similaritySearch(
            question,
            CONFIG.similarity.topK
        );

        Utils.displayResults(results);
    }

    Utils.printDivider();
    console.log(`✅ Busca por similaridade concluída com sucesso!`);
    Utils.printDivider();

} catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
} finally {
    if (_neo4jVectorStore)
        await _neo4jVectorStore.close();
}