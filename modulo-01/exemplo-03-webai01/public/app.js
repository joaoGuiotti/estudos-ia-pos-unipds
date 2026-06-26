// ── DOM refs ──────────────────────────────────────────────────────────────────
const chatEl        = document.getElementById('chat');
const questionEl    = document.getElementById('question');
const sendBtn       = document.getElementById('send-btn');
const statusBar     = document.getElementById('status-bar');
const modelStatus   = document.getElementById('model-status');
const statusDot     = document.getElementById('status-dot');
const settingsToggle= document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const applyBtn      = document.getElementById('apply-btn');
const tempSlider    = document.getElementById('temp-slider');
const topkSlider    = document.getElementById('topk-slider');
const tempVal       = document.getElementById('temp-val');
const topkVal       = document.getElementById('topk-val');

// ── State ─────────────────────────────────────────────────────────────────────
let session     = null;
let busy        = false;
let modelParams = null;   // populated by loadParams()

// ── Model params (limits) ────────────────────────────────────────────────────
/**
 * Tenta obter os limites reais via LanguageModel.params() (disponível apenas
 * em Chrome Extensions). Em contexto de web page usa os valores conhecidos
 * como fallback.
 * @returns {{ defaultTemperature, maxTemperature, defaultTopK, maxTopK }}
 */
async function loadParams() {
    const FALLBACK = {
        defaultTemperature: 1.0,
        maxTemperature:     2.0,
        defaultTopK:        3,
        maxTopK:            128,
    };
    try {
        const p = await LanguageModel.params();
        console.log('[AI] params:', p);
        return { ...FALLBACK, ...p };   // merge: API wins, fallback fills gaps
    } catch {
        console.info('[AI] params() indisponível — usando valores padrão');
        return FALLBACK;
    }
}

/**
 * Configura min / max / value dos sliders com os limites reais do modelo
 * e atualiza as labels de dica.
 */
function configureSliders(p) {
    // Temperature
    tempSlider.min   = 0;
    tempSlider.max   = p.maxTemperature;
    tempSlider.step  = 0.01;
    tempSlider.value = p.defaultTemperature;
    tempVal.textContent = Number(p.defaultTemperature).toFixed(2);
    document.getElementById('temp-hint').textContent =
        `0 = determinístico · máx ${p.maxTemperature}`;

    // Top-K
    topkSlider.min   = 1;
    topkSlider.max   = p.maxTopK;
    topkSlider.step  = 1;
    topkSlider.value = p.defaultTopK;
    topkVal.textContent = p.defaultTopK;
    document.getElementById('topk-hint').textContent =
        `padrão ${p.defaultTopK} · máx ${p.maxTopK}`;
}

// ── Settings panel toggle ─────────────────────────────────────────────────────
settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
});

// Live slider labels
tempSlider.addEventListener('input', () => {
    tempVal.textContent = Number(tempSlider.value).toFixed(2);
});
topkSlider.addEventListener('input', () => {
    topkVal.textContent = topkSlider.value;
});

// Apply: recreate session with new params
applyBtn.addEventListener('click', async () => {
    settingsPanel.classList.remove('open');
    await initSession();
});

// ── Status helpers ────────────────────────────────────────────────────────────
function setStatus(text) { statusBar.textContent = text; }

function setDot(color) {
    statusDot.style.background = color;
    statusDot.style.boxShadow  = `0 0 8px ${color}`;
}

function setReady(on) {
    questionEl.disabled = !on;
    sendBtn.disabled    = !on;
    if (on) questionEl.focus();
}

// ── Chat helpers ──────────────────────────────────────────────────────────────
function addMessage(role, html = '') {
    const wrap   = document.createElement('div');
    wrap.className = `msg ${role}`;

    const label  = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = role === 'user' ? 'Você' : 'IA';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = html;

    wrap.append(label, bubble);
    chatEl.appendChild(wrap);
    chatEl.scrollTop = chatEl.scrollHeight;
    return bubble;
}

// ── Session init ──────────────────────────────────────────────────────────────
async function initSession() {
    setReady(false);
    setStatus('Verificando disponibilidade do modelo…');
    setDot('#f59e0b');
    modelStatus.textContent = 'Inicializando…';

    if (session) {
        session.destroy?.();
        session = null;
    }

    try {
        const availability = await LanguageModel.availability();
        console.log('[AI] availability:', availability);

        if (availability === 'no') {
            modelStatus.textContent = 'Indisponível';
            setDot('#ef4444');
            setStatus('LanguageModel não está disponível neste dispositivo/navegador.');
            return;
        }

        if (availability === 'after-download') {
            setStatus('Baixando modelo… aguarde.');
        }

        const temperature = parseFloat(tempSlider.value);
        const topK        = parseInt(topkSlider.value, 10);

        session = await LanguageModel.create({
            temperature,
            topK,
            expectedInputLanguages: ['pt'],
            initialPrompts: [{
                role: 'system',
                content: 'Você é um assistente de IA que responde de forma clara e objetiva em português.'
            }]
        });

        modelStatus.textContent = `Gemini Nano · T=${temperature.toFixed(2)} K=${topK}`;
        setDot('#22c55e');
        setStatus('');
        setReady(true);

    } catch (err) {
        console.error('[AI] init error:', err);
        modelStatus.textContent = 'Erro';
        setDot('#ef4444');
        setStatus('Erro ao inicializar: ' + err.message);
    }
}

// ── Send message ──────────────────────────────────────────────────────────────
async function sendMessage() {
    const question = questionEl.value.trim();
    if (!question || busy || !session) return;

    busy = true;
    setReady(false);
    questionEl.value = '';
    questionEl.style.height = '48px';

    addMessage('user', question);

    const aiBubble = addMessage('ai', '');
    aiBubble.classList.add('cursor');
    setStatus('Gerando resposta…');

    try {
        const stream = await session.promptStreaming([
            { role: 'user', content: question }
        ]);

        let fullText = '';
        for await (const token of stream) {
            fullText += token;
            aiBubble.innerHTML = markdown.toHTML(fullText);
            chatEl.scrollTop = chatEl.scrollHeight;
        }
    } catch (err) {
        aiBubble.innerHTML = `<em style="color:#f87171">Erro: ${err.message}</em>`;
        console.error('[AI] prompt error:', err);
    } finally {
        aiBubble.classList.remove('cursor');
        setStatus('');
        busy = false;
        setReady(true);
    }
}

// ── Events ────────────────────────────────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);

questionEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

questionEl.addEventListener('input', () => {
    questionEl.style.height = '48px';
    questionEl.style.height = Math.min(questionEl.scrollHeight, 140) + 'px';
});

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
    modelParams = await loadParams();
    configureSliders(modelParams);
    await initSession();
})();
