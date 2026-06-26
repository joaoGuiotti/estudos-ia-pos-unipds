import { LanguageModelService } from '../services/language-model.service';
import { TranslationService } from '../services/translation.service';
import { View } from '../views/view';

/**
 * Handles user interaction: form submit, streaming response,
 * file upload, and parameter controls.
 * Bridges the View (DOM) with the Services (AI/Translation).
 */
export class ChatController {

    constructor(
        private readonly lmService: LanguageModelService,
        private readonly translationService: TranslationService,
        private readonly view: View,
    ) { }

    bindEvents(): void {
        this.view.onTemperatureChange((e: Event) => {
            this.view.updateTemperatureDisplay((e.target as HTMLInputElement).value);
        });

        this.view.onTopKChange((e: Event) => {
            this.view.updateTopKDisplay((e.target as HTMLInputElement).value);
        });

        this.view.onFileButtonClick(() => {
            this.view.triggerFileInput();
        });

        this.view.onFileChange((e: Event) => {
            this.view.handleFilePreview(e);
        });

        this.view.onFormSubmit((e: SubmitEvent) => {
            e.preventDefault();
            this.#handleSubmit();
        });
    }

    // ── Private ───────────────────────────────────────────────────────────────

    async #handleSubmit(): Promise<void> {
        if (this.lmService.isStreaming) {
            this.lmService.abort();
            this.view.setButtonToSendMode();
            return;
        }

        const question = this.view.getQuestionText();
        const image    = this.view.getFile();

        if (!question && !image) return;

        const temperature = this.view.getTemperature();
        const topK        = this.view.getTopK();

        this.view.setButtonToStopMode();
        await this.view.setOutput('');

        try {
            let rawOutput = '';

            for await (const chunk of this.lmService.stream(question, temperature, topK, image)) {
                rawOutput += chunk;
                await this.view.setOutput(rawOutput);
            }

            if (this.translationService.isReady) {
                await this.view.setOutput('Traduzindo para português...');
                const translated = await this.translationService.translateToPortuguese(rawOutput);
                await this.view.setOutput(translated);
            }

        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('[ChatController] stream error:', err);
                this.view.showError([`❌ Erro ao gerar resposta: ${(err as Error).message}`]);
            }
        } finally {
            this.view.setButtonToSendMode();
        }
    }

}
