import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { mkdir, writeFile } from "node:fs/promises";
import { CONFIG } from "./core/config.ts";
import { DocumentProcessorService } from "./services/document-processor.service.ts";
import { RagService } from "./services/rag.service.ts";
import { Utils } from "./shared/utils.ts";

let _neo4jVectorStore: Neo4jVectorStore | null = null;

async function clearAll(vectorStore: Neo4jVectorStore, nodeLabeL: string) {
    Utils.log(`\n 🗑️  Apagando todos os documentos do banco de dados...`);
    await vectorStore.query(
        `MATCH (n: \`${nodeLabeL}\`) DETACH DELETE n`
    )
    Utils.log(`\n ✅ Documentos removidos com sucesso. \n`);
}

try {
    Utils.log('\n 🚀 Inicializando Sistema de Embeddings com Neo4j... \n');

    const documentProcessor = DocumentProcessorService.create(
        CONFIG.pdf.path,
        CONFIG.textSplitter
    );

    const chunks = await documentProcessor.loadAndSplitDocument();

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embeddings.model,
        pretrainedOptions: CONFIG.embeddings.pretrainedOptions
    });

    Utils.log('Modelo carregado com sucesso');

    _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
        embeddings,
        CONFIG.neo4j
    );

    clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);

    for (const [index, chunk] of chunks.entries()) {
        Utils.log(` ✅ Adicionando documento:  ${index + 1}/${chunks.length}`);
        await _neo4jVectorStore.addDocuments([chunk]);
    }

    Utils.log('✅ Documentos adicionados com sucesso');

    Utils.log("🔍 ETAPA 2: Executando buscas por similaridade...\n");

    const questions = [
        "O que são tensores e como são representados em JavaScript?",
        // "Como converter objetos JavaScript em tensores?",
        // "O que é normalização de dados e por que é necessária?",
        // "Como funciona uma rede neural no TensorFlow.js?",
        // "O que significa treinar uma rede neural?",
        // "o que é hot enconding e quando usar?"
    ];

    const ragService = RagService.create({ debugLog: Utils.log, vectorStore: _neo4jVectorStore! });

    for (const index in questions) {
        const question = questions[index];

        Utils.log(`\n${'='.repeat(80)}`);
        Utils.log(`📌 PERGUNTA: ${question}`);
        Utils.log('='.repeat(80));

        const result = await ragService.answerQuestion(question!);

        if (result.error) {
            Utils.log(`\n❌ Erro: ${result.error}\n`);
            continue;
        }

        Utils.log(`\n${result.answer}\n`);

        await mkdir(CONFIG.output.answersFolder, { recursive: true });
        const fileName = `${CONFIG.output.answersFolder}/${CONFIG.output.fileName}-${index}-${Date.now()}.md`;
        await writeFile(fileName, result.answer!);
    }


    Utils.printDivider();
    Utils.log(`✅ Busca por similaridade concluída com sucesso!`);
    Utils.printDivider();

} catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
} finally {
    if (_neo4jVectorStore)
        await _neo4jVectorStore.close();
}