export class ProductController {
    #productView;
    #currentUser = null;
    #events;
    #productService;
    #chromaService;
    constructor({
        productView,
        events,
        productService,
        chromaService
    }) {
        this.#productView = productView;
        this.#productService = productService;
        this.#chromaService = chromaService;
        this.#events = events;
        this.init();
    }

    static init(deps) {
        return new ProductController(deps);
    }

    async init() {
        this.setupCallbacks();
        this.setupEventListeners();
        const products = await this.#productService.getProducts();
        this.#productView.render(products, true);
    }

    setupEventListeners() {

        this.#events.onUserSelected((user) => {
            this.#currentUser = user;
            this.#productView.onUserSelected(user);
            this.#events.dispatchRecommend(user)
        })

        this.#events.onRecommendationsReady(({ recommendations }) => {
            this.#productView.render(recommendations, false);
        });
    }

    setupCallbacks() {
        this.#productView.registerBuyProductCallback(this.handleBuyProduct.bind(this));
        this.#productView.registerSemanticSearchCallback(this.handleSemanticSearch.bind(this));
    }

    async handleSemanticSearch(query) {
        if (!this.#chromaService) {
            console.warn("ChromaService not initialized, falling back to all products.");
            return;
        }

        console.log(`[ChromaDB] Searching for: "${query}"`);
        const similarProducts = await this.#chromaService.searchSimilarProducts(query, 5);

        if (similarProducts.length === 0) {
            console.log("[ChromaDB] No results, showing all products.");
            const allProducts = await this.#productService.getProducts();
            this.#productView.render(allProducts, this.#currentUser === null);
            return;
        }

        // ChromaDB already returns all fields from metadata (name, category, price, color)
        // We preserve the ranked order returned by vector similarity
        console.log(`[ChromaDB] Found ${similarProducts.length} similar products:`, similarProducts.map(p => p.name));
        this.#productView.render(similarProducts, this.#currentUser === null);
    }

    async handleBuyProduct(product) {
        const user = this.#currentUser;
        this.#events.dispatchPurchaseAdded({ user, product });
    }

}
