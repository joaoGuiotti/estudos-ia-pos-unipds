import { marked } from 'marked';

interface ViewElements {
    temperature:      HTMLInputElement;
    temperatureValue: HTMLElement;
    topKValue:        HTMLElement;
    topK:             HTMLInputElement;
    form:             HTMLFormElement;
    questionInput:    HTMLInputElement | HTMLTextAreaElement;
    output:           HTMLElement;
    button:           HTMLButtonElement;
    year:             HTMLElement;
    fileInput:        HTMLInputElement;
    filePreview:      HTMLElement;
    fileUploadBtn:    HTMLButtonElement;
    fileSelectedName: HTMLElement;
}

export class View {
    readonly elements: ViewElements;

    constructor() {
        this.elements = {
            temperature:      this.#get<HTMLInputElement>('temperature'),
            temperatureValue: this.#get('temp-value'),
            topKValue:        this.#get('topk-value'),
            topK:             this.#get<HTMLInputElement>('topK'),
            form:             this.#get<HTMLFormElement>('question-form'),
            questionInput:    this.#get<HTMLTextAreaElement>('question'),
            output:           this.#get('output'),
            button:           this.#get<HTMLButtonElement>('ask-button'),
            year:             this.#get('year'),
            fileInput:        this.#get<HTMLInputElement>('file-input'),
            filePreview:      this.#get('file-preview'),
            fileUploadBtn:    this.#get<HTMLButtonElement>('file-upload-btn'),
            fileSelectedName: this.#get('file-selected-name'),
        };
    }

    /** Type-safe getElementById that throws if the element is missing. */
    #get<T extends HTMLElement = HTMLElement>(id: string): T {
        const el = document.getElementById(id);
        if (!el) throw new Error(`[View] Element #${id} not found in DOM.`);
        return el as T;
    }

    // ── Display ──────────────────────────────────────────────────────────────

    setYear(): void {
        this.elements.year.textContent = String(new Date().getFullYear());
    }

    async setOutput(text: string): Promise<void> {
        this.elements.output.innerHTML = await marked.parse(text);
    }

    appendOutput(text: string): void {
        this.elements.output.textContent += text;
    }

    showError(errors: string[]): void {
        this.elements.output.innerHTML = errors.join('<br/>');
        this.elements.button.disabled = true;
    }

    // ── Parameters ───────────────────────────────────────────────────────────

    initializeParameters(params: LanguageModelParams): void {
        const { topK, topKValue, temperature, temperatureValue } = this.elements;

        topK.min   = '1';
        topK.max   = String(params.maxTopK);
        topK.value = String(params.defaultTopK);
        topKValue.textContent = String(params.defaultTopK);

        temperature.min   = '0';
        temperature.max   = String(params.maxTemperature);
        temperature.value = String(params.defaultTemperature);
        temperatureValue.textContent = params.defaultTemperature.toFixed(2);
    }

    updateTemperatureDisplay(value: string): void {
        this.elements.temperatureValue.textContent = Number(value).toFixed(2);
    }

    updateTopKDisplay(value: string): void {
        this.elements.topKValue.textContent = value;
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    getQuestionText(): string {
        return this.elements.questionInput.value.trim();
    }

    getTemperature(): number {
        return parseFloat(this.elements.temperature.value);
    }

    getTopK(): number {
        return parseInt(this.elements.topK.value, 10);
    }

    getFile(): File | undefined {
        return this.elements.fileInput.files?.[0];
    }

    // ── Button state ─────────────────────────────────────────────────────────

    setButtonToStopMode(): void {
        this.elements.button.textContent = 'Parar';
        this.elements.button.classList.add('stop-button');
    }

    setButtonToSendMode(): void {
        this.elements.button.textContent = 'Enviar';
        this.elements.button.classList.remove('stop-button');
    }

    // ── File handling ────────────────────────────────────────────────────────

    triggerFileInput(): void {
        this.elements.fileInput.click();
    }

    handleFilePreview(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file  = input.files?.[0];

        this.elements.filePreview.innerHTML = '';
        this.elements.fileSelectedName.textContent = '';
        this.elements.fileSelectedName.classList.remove('selected');

        if (!file) return;

        this.elements.fileSelectedName.textContent = `✓ ${file.name}`;
        this.elements.fileSelectedName.classList.add('selected');

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        if (file.type.startsWith('image/')) {
            const img     = document.createElement('img');
            img.src       = URL.createObjectURL(file);
            img.className = 'preview-image';
            img.alt       = file.name;
            fileInfo.appendChild(img);
        }

        const removeBtn       = document.createElement('button');
        removeBtn.type        = 'button';
        removeBtn.className   = 'remove-file-btn';
        removeBtn.textContent = '× Remover imagem';
        removeBtn.addEventListener('click', () => this.#clearFile());

        fileInfo.appendChild(removeBtn);
        this.elements.filePreview.appendChild(fileInfo);
    }

    #clearFile(): void {
        this.elements.fileInput.value      = '';
        this.elements.filePreview.innerHTML = '';
        this.elements.fileSelectedName.textContent = '';
        this.elements.fileSelectedName.classList.remove('selected');
    }

    // ── Event binding ────────────────────────────────────────────────────────

    onTemperatureChange(callback: (e: Event) => void): void {
        this.elements.temperature.addEventListener('input', callback);
    }

    onTopKChange(callback: (e: Event) => void): void {
        this.elements.topK.addEventListener('input', callback);
    }

    onFileChange(callback: (e: Event) => void): void {
        this.elements.fileInput.addEventListener('change', callback);
    }

    onFileButtonClick(callback: (e: Event) => void): void {
        this.elements.fileUploadBtn.addEventListener('click', callback);
    }

    onFormSubmit(callback: (e: SubmitEvent) => void): void {
        this.elements.form.addEventListener('submit', callback);
    }
}
