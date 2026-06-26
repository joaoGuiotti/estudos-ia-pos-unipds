importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

const MODEL_PATH = `yolov5n_web_model/model.json`;
const LABELS_PATH = `yolov5n_web_model/labels.json`;
const INPUT_MODEL_DIMENSION = 640;
const CLASS_THRESHOLD = 0.5; // Limite de confiança para filtrar predições (ajuste conforme necessário)

let _labels = [];
let _model = [];

const loadModuleAndLabels = async () => {
    await tf.ready();

    _labels = await (await fetch(LABELS_PATH)).json();
    _model = await tf.loadGraphModel(MODEL_PATH);

    // warm up the model

    const dummyInput = tf.ones(_model.inputs[0].shape);
    await _model.executeAsync(dummyInput);

    tf.dispose(dummyInput);

    postMessage({
        type: 'model-loaded',
    })
}


/**
 * 
 *  Pré processamento da imagem para o modelo YOLO
 *  - tf.browser.fromPixels() : Converte a imagem do canvas em um tensor. [H, W, 3]
 *  - tf.image.resizeBilinear() : Redimensiona a imagem para o tamanho esperado pelo modelo (ex: 640x640).
 *  - tf.div() : Normaliza os valores dos pixels para o intervalo [0, 1] dividindo por 255.
 *  - tf.expandDims() : Adiciona uma dimensão extra para representar o batch size, resultando em um tensor de forma [1, H, W, 3].
 * 
 *  Uso de tf.tidy() para garantir que os tensores intermediários sejam descartados corretamente, evitando vazamentos de memória.
 *  - Garante que os tensores criados durante o pré-processamento sejam liberados da memória após o uso, mantendo a eficiência do aplicativo.
 * 
 *  O resultado é um tensor pronto para ser alimentado no modelo YOLO para inferência.
 * 
 *  Referências:
 *  - https://www.tensorflow.org/js/guide/tensors_for_browser
 *  - https://www.tensorflow.org/js/guide/memory_management
 *  - https://www.tensorflow.org/js/models#preprocessing-inputs
 * 
 *  Observação: O código de pré-processamento é um exemplo básico e pode precisar de ajustes dependendo dos requisitos específicos do modelo YOLO utilizado (ex: normalização, redimensionamento, etc.).
 * 
 *  Dica: Para otimizar o desempenho, considere usar WebGL para acelerar as operações de tensor no navegador.
 */
const preprocessImage = (imageBitmap) => {
    return tf.tidy(() => {
        const img = tf.browser.fromPixels(imageBitmap);

        return tf.image
            .resizeBilinear(img, [INPUT_MODEL_DIMENSION, INPUT_MODEL_DIMENSION])
            .div(255)
            .expandDims(0);
    })
}

const runInference = async (tensor) => {
    const output = await _model.executeAsync(tensor)
    tf.dispose(tensor)
    // Assume que as 3 primeiras saídas são:
    // caixas (boxes), pontuações (scores) e classes

    const [boxes, scores, classes] = output.slice(0, 3)
    const [boxesData, scoresData, classesData] = await Promise.all(
        [
            boxes.data(),
            scores.data(),
            classes.data(),
        ]
    )

    output.forEach(t => t.dispose())

    return {
        boxes: boxesData,
        scores: scoresData,
        classes: classesData
    }
};

/**
 * Processamento das predições do modelo YOLO
 * - Aplica olimitador de confiança (CLASS_THRESHOLD) para filtrar predições de baixa confiança.
 * - Mapeia as classes preditas para seus rótulos correspondentes usando o array _labels.
 * - Filtra as predições para manter apenas aquelas que correspondem à classe "kite".
 * - Para cada predição válida, pode-se implementar lógica adicional, como desenhar caixas delimitadoras ou enviar coordenadas para o jogo.
 */
function* processPrediction({ boxes, scores, classes }, width, height) {
    for (let index = 0; index < scores.length; index++) {
        if (scores[index] < CLASS_THRESHOLD) continue

        const label = _labels[classes[index]]
        if (label !== 'kite') continue

        let [x1, y1, x2, y2] = boxes.slice(index * 4, (index + 1) * 4)
        x1 *= width
        x2 *= width
        y1 *= height
        y2 *= height

        const boxWidth = x2 - x1
        const boxHeight = y2 - y1
        const centerX = x1 + boxWidth / 2
        const centerY = y1 + boxHeight / 2

        yield {
            x: centerX,
            y: centerY,
            score: (scores[index] * 100).toFixed(2)
        }

    }
}

loadModuleAndLabels();

self.onmessage = async ({ data }) => {
    if (data.type !== 'predict') return;

    if (!_model) return;

    const input = preprocessImage(data.image);
    const { width, height } = data.image;

    const inferenceResults = await runInference(input);

    for (const prediction of processPrediction(inferenceResults, width, height)) {
        postMessage({
            type: 'prediction',
            ...prediction
        });
    }

};

console.log('🧠 YOLOv5n Web Worker initialized');
