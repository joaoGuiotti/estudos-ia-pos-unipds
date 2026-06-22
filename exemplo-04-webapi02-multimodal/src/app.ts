import { ChatController } from './controllers/chat.controller';
import { LanguageModelService } from './services/language-model.service';
import { TranslationService } from './services/translation.service';
import { DownloadBanner } from './views/download-banner';
import { View } from './views/view';

/**
 * Application root. Coordinates service initialization,
 * view setup, and controller wiring.
 */
export class App {
    private readonly lmService          = new LanguageModelService();
    private readonly translationService = new TranslationService();
    private readonly view               = new View();

    async init(): Promise<void> {
        console.log('[App] starting…');
        this.view.setYear();

        await this.checkLanguageModelRequirements();
        await this.initTranslator();
        await this.loadParams();
        this.wireController();

        console.log('[App] ready');
    }

    // ── Private steps ────────────────────────────────────────────────────────

    private async checkLanguageModelRequirements(): Promise<void> {
        const errors = await this.lmService.checkRequirements();
        if (errors) {
            this.view.showError(errors);
            throw new Error('[App] requirements not met — aborting init');
        }
    }

    private async initTranslator(): Promise<void> {
        const availability = await this.translationService.checkAvailability();
        console.log('[Translator] availability:', availability);

        // Translator API returns 'available' (not 'readily') when ready without download
        if (availability === 'available' || availability === 'readily') {
            await this.translationService.initialize();
            return;
        }

        if (availability === 'downloadable' || availability === 'downloading') {
            // Chrome requires a real user gesture to download models
            await DownloadBanner.show((onProgress) =>
                this.translationService.initialize(onProgress)
            );
            return;
        }

        console.warn('[Translator] not available on this device — translation disabled');
    }

    private async loadParams(): Promise<void> {
        const params = await this.lmService.getParams();
        console.log('[App] model params:', params);
        this.view.initializeParameters(params);
    }

    private wireController(): void {
        const controller = new ChatController(
            this.lmService,
            this.translationService,
            this.view,
        );
        controller.bindEvents();
    }
}
