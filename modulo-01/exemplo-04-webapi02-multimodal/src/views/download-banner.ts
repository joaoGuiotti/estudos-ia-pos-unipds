/**
 * UI component for the model download prompt.
 * Shown when a Chrome AI model needs to be downloaded and
 * Chrome requires a real user gesture to start the download.
 */
export class DownloadBanner {

    /**
     * Renders a dismissible download banner and waits for the user
     * to click "Baixar agora" before calling the provided download fn.
     *
     * @param downloadFn  Called inside the click handler (valid user gesture).
     *                    Receives an optional progress callback (0–100).
     */
    static show(
        downloadFn: (onProgress: (percent: number) => void) => Promise<void>,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const banner   = DownloadBanner.#createBanner();
            const btn      = banner.querySelector<HTMLButtonElement>('#dl-btn')!;
            const progress = banner.querySelector<HTMLElement>('#dl-progress')!;

            document.body.prepend(banner);

            btn.addEventListener('click', async () => {
                btn.disabled    = true;
                btn.textContent = 'Baixando…';

                try {
                    await downloadFn((pct) => {
                        progress.textContent = `${pct}%`;
                    });
                    banner.remove();
                    resolve();
                } catch (err) {
                    btn.textContent  = 'Tentar novamente';
                    btn.disabled     = false;
                    progress.textContent = '❌ Erro';
                    console.error('[DownloadBanner] download failed:', err);
                    reject(err);
                }
            });
        });
    }

    static #createBanner(): HTMLElement {
        const el = document.createElement('div');
        el.setAttribute('role', 'alert');
        el.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 9999;
            background: #1e1e2a;
            border-bottom: 1px solid #6366f1;
            padding: 0.85rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-family: system-ui, sans-serif;
            font-size: 0.9rem;
            color: #e2e2e8;
        `;
        el.innerHTML = `
            <span>⬇️ O modelo de tradução precisa ser baixado.</span>
            <button id="dl-btn" style="
                background: #6366f1;
                border: none;
                border-radius: 8px;
                color: #fff;
                padding: 0.35rem 0.9rem;
                cursor: pointer;
                font-size: 0.85rem;
            ">Baixar agora</button>
            <span id="dl-progress" style="font-size: 0.8rem; color: #818cf8;"></span>
        `;
        return el;
    }
}
