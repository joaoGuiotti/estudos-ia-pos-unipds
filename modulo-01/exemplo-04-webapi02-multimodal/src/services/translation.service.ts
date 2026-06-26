export type TranslatorAvailability = 'available' | 'readily' | 'downloadable' | 'downloading' | 'no';

/**
 * Wraps the Chrome Translation API (Translator + LanguageDetector).
 *
 * ⚠️ create() MUST be called from a user gesture (click/keypress)
 * when availability is 'downloadable' or 'downloading'.
 */
export class TranslationService {

    private translator: TranslatorInstance | null = null;
    private languageDetector: LanguageDetectorInstance | null = null;

    /**
     * Checks availability WITHOUT triggering a download.
     * Safe to call on page load.
     */
    async checkAvailability(): Promise<TranslatorAvailability> {
        if (!('Translator' in self)) return 'no';
        return Translator.availability({ sourceLanguage: 'en', targetLanguage: 'pt' }) as Promise<TranslatorAvailability>;
    }

    /**
     * Initializes Translator and LanguageDetector.
     * Must be called from a user gesture when model needs download.
     */
    async initialize(onProgress?: (percent: number) => void): Promise<void> {
        try {
            this.translator = await Translator.create({
                sourceLanguage: 'en',
                targetLanguage: 'pt',
                monitor: (m) => {
                    m.addEventListener('downloadprogress', (e) => {
                        const ev = e as ProgressEvent;
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        console.log(`[Translator] download ${percent}%`);
                        onProgress?.(percent);
                    });
                },
            });
            console.log('[Translator] ready');

            if ('LanguageDetector' in self) {
                this.languageDetector = await LanguageDetector.create();
                console.log('[LanguageDetector] ready');
            }
        } catch (error) {
            console.error('[Translator] error:', error);
        }
    }

    get isReady(): boolean {
        return this.translator !== null;
    }

    /**
     * Translates text to Portuguese.
     * Returns the original text if the translator is not ready
     * or if the text is already in Portuguese.
     */
    async translateToPortuguese(text: string): Promise<string> {
        if (!this.translator) return text;

        try {
            if (this.languageDetector) {
                const results = await this.languageDetector.detect(text);
                if (results[0]?.detectedLanguage === 'pt') {
                    console.log('[Translator] already Portuguese, skipping');
                    return text;
                }
            }

            let translated = '';
            const stream = this.translator.translateStreaming(text);
            for await (const chunk of stream) {
                // translateStreaming yields incremental deltas (unlike
                // promptStreaming which yields cumulative text) — use +=.
                translated += chunk;
            }
            return translated;

        } catch (err) {
            console.error('[Translator] error:', err);
            return text;
        }
    }
}