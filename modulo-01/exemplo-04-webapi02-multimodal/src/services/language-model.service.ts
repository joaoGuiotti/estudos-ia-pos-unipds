/**
 * Wraps the LanguageModel built-in Chrome AI API.
 * Responsible for: availability checks, param loading,
 * session creation, and streaming.
 *
 * Supported modalities: text + image (single file).
 */
export class LanguageModelService {
    private session: LanguageModelSession | null = null;
    private abortController: AbortController | null = null;

    /** Known Gemini Nano defaults — fallback when params() is unavailable (web page context). */
    static readonly DEFAULT_PARAMS: LanguageModelParams = {
        defaultTemperature: 1.0,
        maxTemperature: 2.0,
        defaultTopK: 3,
        maxTopK: 128,
    };

    // ── Requirements ─────────────────────────────────────────────────────────

    /**
     * Validates that the environment supports the LanguageModel API.
     * Does NOT trigger any model download.
     * @returns Array of user-facing error messages, or null if all good.
     */
    async checkRequirements(): Promise<string[] | null> {
        if (!('LanguageModel' in self)) {
            return [
                '⚠️ As APIs nativas de IA não estão ativas.',
                'Ative a flag em chrome://flags/#prompt-api-for-gemini-nano',
                'Depois reinicie o Chrome e tente novamente.',
            ];
        }

        const availability = await LanguageModel.availability();
        console.log('[LanguageModel] availability:', availability);

        if (availability === 'no') {
            return ['⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.'];
        }

        if (availability === 'downloading' || availability === 'downloadable') {
            console.info('[LanguageModel] model needs download — downloading…');
            await this.#downloadModel();
        }

        return null;
    }

    // ── Params ────────────────────────────────────────────────────────────────

    /**
     * Fetches model params from the API.
     * Falls back to DEFAULT_PARAMS when params() is unavailable (web page context).
     */
    async getParams(): Promise<LanguageModelParams> {
        try {
            const params = await LanguageModel.params();
            return { ...LanguageModelService.DEFAULT_PARAMS, ...params };
        } catch {
            console.info('[LanguageModel] params() unavailable — using defaults');
            return LanguageModelService.DEFAULT_PARAMS;
        }
    }

    // ── Streaming ─────────────────────────────────────────────────────────────

    /**
     * Creates a new session and streams a response for the given prompt.
     * Automatically aborts any previous in-flight request.
     * Accepts an optional image File for multimodal prompts.
     */
    async *stream(
        question: string,
        temperature: number,
        topK: number,
        image?: File,
    ): AsyncGenerator<string> {
        this.abort();
        this.abortController = new AbortController();
        this.session?.destroy();

        const sessionConfig = this.#buildSessionConfig(temperature, topK, image);

        let currentImage = image;

        try {
            this.session = await LanguageModel.create(sessionConfig);
        } catch (err: unknown) {
            const msg = (err as Error).message ?? '';

            // If the device doesn't support multimodal input, retry text-only.
            if (msg.toLowerCase().includes('capability') && currentImage) {
                console.warn('[LanguageModel] multimodal unavailable, falling back to text-only');
                currentImage = undefined;
                (sessionConfig as LanguageModelCreateOptions).expectedInputs = [
                    { type: 'text', languages: ['en'] },
                ];
                this.session = await LanguageModel.create(sessionConfig);
                yield '⚠️ Multimodal não disponível neste dispositivo. Respondendo só com texto.\n\n';
                if (!question.trim()) { this.abortController = null; return; }
            } else {
                throw err;
            }
        }

        const signal = this.abortController.signal;

        // Text-only: pass string directly. Multimodal: pass content array.
        const prompt = currentImage
            ? [{ role: 'user' as const, content: await this.#buildContent(question, currentImage) }]
            : question;

        const responseStream = (this.session as LanguageModelSession).promptStreaming(
            prompt as LanguageModelMessage[],
            { signal },
        );

        for await (const chunk of responseStream) {
            if (signal.aborted) break;
            yield chunk;
        }

        // Clear controller so isStreaming returns false after completion.
        this.abortController = null;
    }

    // ── Abort ─────────────────────────────────────────────────────────────────

    abort(): void {
        this.abortController?.abort();
        this.abortController = null;
    }

    get isStreaming(): boolean {
        return this.abortController !== null && !this.abortController.signal.aborted;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    #buildSessionConfig(
        temperature: number,
        topK: number,
        image?: File,
    ): LanguageModelCreateOptions {
        const expectedInputs: Array<{ type: string; languages?: string[] }> = [
            { type: 'text', languages: ['en'] },
            ...(image ? [{ type: 'image' }] : []),
        ];

        return {
            temperature,
            topK,
            expectedInputs,
            // Spec uses 'expectedOutputs' (plural) — singular is not recognised.
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
            initialPrompts: [{
                role: 'system',
                content: [{
                    type: 'text',
                    value: 'You are an AI assistant that responds clearly and objectively. ' +
                           'Format your answers using Markdown.',
                }],
            }],
        } as LanguageModelCreateOptions;
    }

    async #downloadModel(): Promise<void> {
        try {
            const session = await LanguageModel.create({
                monitor: (m: EventTarget) => {
                    m.addEventListener('downloadprogress', (e: Event) => {
                        const { loaded, total } = e as ProgressEvent;
                        console.log(`[LanguageModel] download ${Math.round((loaded / total) * 100)}%`);
                    });
                },
            } as LanguageModelCreateOptions);
            session.destroy();
        } catch (err) {
            console.error('[LanguageModel] download failed:', err);
        }
    }

    async #buildContent(
        question: string,
        image: File,
    ): Promise<Array<{ type: string; value: string | Blob }>> {
        const content: Array<{ type: string; value: string | Blob }> = [];

        if (question.trim()) {
            content.push({ type: 'text', value: question });
        }

        content.push({ type: 'image', value: image });

        return content;
    }
}
