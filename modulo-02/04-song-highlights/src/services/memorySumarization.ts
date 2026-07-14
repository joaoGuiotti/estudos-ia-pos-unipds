import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";
import { config } from "../config.ts";

export type MemoryService = {
    checkPointer: PostgresSaver;
    store: PostgresStore;
}

interface IMemoryServiceParams {
    dbUri?: string;
}

export class MemorySumarizationService {
    private _checkPointer!: PostgresSaver;
    private _store!: PostgresStore;

    get checkPointer(): PostgresSaver {
        return this._checkPointer;
    }

    get store(): PostgresStore {
        return this._store;
    }

    private constructor(params: IMemoryServiceParams) {
        const dbUri = params.dbUri ?? config.memory.dbUri;
        this._checkPointer = PostgresSaver.fromConnString(dbUri);
        this._store = PostgresStore.fromConnString(dbUri);
    }

    /**
     * Cria uma instância de MemoryService com PostgresSaver e PostgresStore configurados.
     * @param dbUri Se fornecido, substitui o valor de memory.dbUri do config.
     * @returns Uma instância de MemoryService com PostgresSaver e PostgresStore configurados.
     */
    public static async create(dbUri: string = config.memory.dbUri): Promise<MemorySumarizationService> {
        const store = PostgresStore.fromConnString(dbUri);
        const checkPointer = PostgresSaver.fromConnString(dbUri);

        await Promise.all([
            store.setup(),
            checkPointer.setup()
        ]);

        console.log('✅ Memória inicializada com sucesso');

        return new MemorySumarizationService({ dbUri });
    }
}

