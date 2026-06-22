import { ChromaClient, Collection } from 'chromadb';
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    [key: string]: any;
}

export class ChromaService {
    private client: ChromaClient;
    private collection: Collection | null = null;
    private extractor: FeatureExtractionPipeline | null = null;
    private collectionName = "ecommerce_products";

    constructor() {
        // Connect to local ChromaDB 0.4.x server (compatible with chromadb@1.8.1)
        this.client = new ChromaClient({ path: "http://localhost:8000" });
    }

    /**
     * Initializes the service by loading the ML model for embeddings
     * and connecting to the ChromaDB collection.
     */
    async init() {
        console.log("Initializing ChromaDB connection...");
        try {
            // Get or create the collection
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
            });
            
            console.log("Loading Transformer model for embeddings...");
            // Load feature extraction pipeline
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            
            console.log("ChromaService initialization complete.");
        } catch (error) {
            console.error("Failed to initialize ChromaService. Ensure Chroma DB is running at localhost:8000.", error);
        }
    }

    /**
     * Generates an embedding vector for a given text.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.extractor) {
            throw new Error("Extractor not initialized. Call init() first.");
        }
        // Generate embedding with mean pooling and L2 normalization
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    /**
     * Synchronizes a list of products to ChromaDB.
     */
    async syncProducts(products: Product[]) {
        if (!this.collection) return;

        console.log(`Syncing ${products.length} products to ChromaDB...`);
        const ids: string[] = [];
        const documents: string[] = [];
        const embeddings: number[][] = [];
        const metadatas: any[] = [];

        for (const product of products) {
            ids.push(product.id.toString());
            
            // Rich text representation including all fields for better semantic matching
            const textToEmbed = [
                product.name,
                `Categoria: ${product.category}`,
                `Cor: ${product.color ?? ''}`,
                `Preço: R$${product.price}`
            ].join('. ');
            documents.push(textToEmbed);
            
            const embedding = await this.generateEmbedding(textToEmbed);
            embeddings.push(embedding);
            
            // Store all product fields as metadata for full reconstruction later
            metadatas.push({
                name: product.name,
                category: product.category,
                price: product.price,
                color: product.color ?? ''
            });
        }

        try {
            await this.collection.upsert({
                ids,
                embeddings,
                metadatas,
                documents
            });
            console.log("Products synced to ChromaDB successfully!");
        } catch (error) {
            console.error("Error syncing products to ChromaDB:", error);
        }
    }

    /**
     * Searches for products similar to the given text query.
     */
    async searchSimilarProducts(query: string, nResults: number = 3) {
        if (!this.collection) return [];

        try {
            const queryEmbedding = await this.generateEmbedding(query);
            
            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: nResults,
            });

            // Map results back to a usable format
            const similarProducts = [];
            if (results.ids && results.ids.length > 0) {
                const ids = results.ids[0];
                const metadatas = results.metadatas[0];
                const distances = results.distances ? results.distances[0] : [];

                for (let i = 0; i < ids.length; i++) {
                    similarProducts.push({
                        id: parseInt(ids[i]),
                        name: metadatas[i]?.name,
                        category: metadatas[i]?.category,
                        price: metadatas[i]?.price,
                        color: metadatas[i]?.color,
                        distance: distances[i]
                    });
                }
            }
            return similarProducts;
        } catch (error) {
            console.error("Error searching in ChromaDB:", error);
            return [];
        }
    }
}
