/**
 * Type declarations for Chrome Built-in AI APIs (experimental).
 * These APIs are only available in Chrome with the appropriate flags enabled.
 *
 * Flags:
 *  - chrome://flags/#prompt-api-for-gemini-nano        (LanguageModel)
 *  - chrome://flags/#translation-api                   (Translator)
 *  - chrome://flags/#language-detector-api             (LanguageDetector)
 *  - chrome://flags/#summarization-api-for-gemini-nano (Summarizer)
 */

// ── Shared ────────────────────────────────────────────────────────────────────

type AIAvailability = 'available' | 'readily' | 'downloadable' | 'downloading' | 'after-download' | 'no';

// ── LanguageModel (Prompt API) ────────────────────────────────────────────────

interface LanguageModelParams {
    defaultTemperature: number;
    maxTemperature:     number;
    defaultTopK:        number;
    maxTopK:            number;
}

interface LanguageModelMessage {
    role:    'user' | 'assistant' | 'system';
    content: string | Array<{ type: string; value?: string; data?: Blob }>;
}

interface LanguageModelCreateOptions {
    temperature?:     number;
    topK?:            number;
    languages?:       string[];
    expectedInputs?:  Array<{ type: string; languages?: string[] }>;
    expectedOutput?:  Array<{ type: string; languages?: string[] }>;
    initialPrompts?:  LanguageModelMessage[];
    signal?:          AbortSignal;
    monitor?:         (monitor: EventTarget) => void;
}

interface LanguageModelSession {
    promptStreaming(messages: LanguageModelMessage[], options?: { signal?: AbortSignal }): AsyncIterable<string>;
    prompt(messages: LanguageModelMessage[], options?: { signal?: AbortSignal }): Promise<string>;
    destroy(): void;
    readonly tokensSoFar: number;
    readonly maxTokens:   number;
    readonly tokensLeft:  number;
}

declare const LanguageModel: {
    availability(options?: Partial<LanguageModelCreateOptions>): Promise<AIAvailability>;
    params(): Promise<LanguageModelParams>;
    create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
};

// ── Translator (Translation API) ─────────────────────────────────────────────

interface TranslatorLanguagePair {
    sourceLanguage: string;
    targetLanguage: string;
}

interface TranslatorCreateOptions extends TranslatorLanguagePair {
    signal?:  AbortSignal;
    monitor?: (monitor: EventTarget) => void;
}

interface TranslatorInstance {
    translate(text: string): Promise<string>;
    translateStreaming(text: string): AsyncIterable<string>;
    destroy(): void;
}

declare const Translator: {
    availability(options: TranslatorLanguagePair): Promise<AIAvailability>;
    create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
};

// ── LanguageDetector ──────────────────────────────────────────────────────────

interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence:       number;
}

interface LanguageDetectorInstance {
    detect(text: string): Promise<LanguageDetectionResult[]>;
    destroy(): void;
}

declare const LanguageDetector: {
    availability(): Promise<AIAvailability>;
    create(options?: { signal?: AbortSignal }): Promise<LanguageDetectorInstance>;
};

// ── Summarizer ────────────────────────────────────────────────────────────────

type SummarizerType   = 'key-points' | 'tl;dr' | 'teaser' | 'headline';
type SummarizerFormat = 'markdown' | 'plain-text';
type SummarizerLength = 'short' | 'medium' | 'long';

interface SummarizerCreateOptions {
    type?:    SummarizerType;
    format?:  SummarizerFormat;
    length?:  SummarizerLength;
    signal?:  AbortSignal;
    monitor?: (monitor: EventTarget) => void;
}

interface SummarizerInstance {
    summarize(text: string, options?: { context?: string }): Promise<string>;
    summarizeStreaming(text: string, options?: { context?: string }): AsyncIterable<string>;
    destroy(): void;
}

declare const Summarizer: {
    availability(options?: Partial<SummarizerCreateOptions>): Promise<AIAvailability>;
    create(options?: SummarizerCreateOptions): Promise<SummarizerInstance>;
};
