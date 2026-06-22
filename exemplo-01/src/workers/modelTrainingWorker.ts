import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';
let _globalCtx: any = {};
let _model: any = {};

console.log('Model training worker initialized');

const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1,
};

// Normaliza um valor entre min e max para o intervalo [0, 1]
// Why? mantém os valores em uma escala consistente, evitando que uma feature com valores maiores domine o modelo.
// Formula: (valor - min) / (max - min)
// Exemplo: 
// price=100, min=0, max=200 -> (100 - 0) / (200 - 0) = 0.5
// age=18, min=18, max=60 -> (18 - 18) / (60 - 18) = 0
const normalize = (value, min, max) => (value - min) / ((max - min) || 1);


function makeContext(products, users) {
    const ages = users.map(u => u.age);
    const prices = products.map(p => p.price);

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const colors = [...new Set(products.map(p => p.color))];
    const categories = [...new Set(products.map(c => c.category))];

    const colorsIndex = Object.fromEntries(
        colors.map((c, i) => [c, i])
    )
    const categoriesIndex = Object.fromEntries(
        categories.map((c, i) => [c, i])
    );

    // Computar a media de idade dos compradores por produto
    // Ajuda a entender o perfil de cada produto
    const midAge = (minAge + maxAge) / 2;
    const ageSums = {}
    const ageCounts = {}

    users.forEach(u => {
        u.purchases.forEach(p => {
            ageSums[p.name] = (ageSums[p.name] || 0) + u.age;
            ageCounts[p.name] = (ageCounts[p.name] || 0) + 1;
        });
    });

    const productAvgAgeNorm = Object.fromEntries(
        products.map(p => {
            const avg = ageCounts[p.name] ?
                ageSums[p.name] / ageCounts[p.name] : midAge;
            return [p.name, normalize(avg, minAge, maxAge)];
        })
    )

    return {
        products,
        users,
        colorsIndex,
        categoriesIndex,
        productAvgAgeNorm,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        numCategories: categories.length,
        numColors: colors.length,
        productVectors: [] as any[],
        // price + age + category + color
        dimentions: 2 + categories.length + colors.length
    };
}

const oneHotWeighted = (index, length, weight) =>
    tf.oneHot(index, length).cast('float32').mul(weight)

function encodeProduct(product, ctx) {
    // Normalize price between [0, 1] and weight it by WEIGHTS.price
    const price = tf.tensor1d([
        normalize(
            product.price,
            ctx.minPrice,
            ctx.maxPrice
        ) * WEIGHTS.price
    ]);

    const age = tf.tensor1d([
        (
            ctx.productAvgAgeNorm[product.name] ?? 0.5
        ) * WEIGHTS.age
    ]);

    const category = oneHotWeighted(
        ctx.categoriesIndex[product.category],
        ctx.numCategories,
        WEIGHTS.category,
    );

    const color = oneHotWeighted(
        ctx.colorsIndex[product.color],
        ctx.numColors,
        WEIGHTS.color,
    );

    return tf.concat1d([
        price, age, category, color
    ]);
}

// Gerando novo tensor com pesos e medidas a partir das compras do usuario
function encodeUser(user, ctx) {
    if (user.purchases.length) {
        return tf.stack(user.purchases.map(p => encodeProduct(p, ctx)))
            .mean(0)
            .reshape([1, ctx.dimentions]);
    }

    return tf.concat1d(
        [
            tf.zeros([1]), // preço é ignorado,
            tf.tensor1d([
                normalize(user.age, ctx.minAge, ctx.maxAge)
                * WEIGHTS.age
            ]),
            tf.zeros([ctx.numCategories]), // categoria ignorada,
            tf.zeros([ctx.numColors]), // color ignorada,

        ]
    ).reshape([1, ctx.dimentions]);

}

function createTrainingData(ctx) {
    const inputs = [];
    const labels = [];

    ctx.users
        .filter(user => user.purchases.length)
        .forEach(user => {
            const userVector = encodeUser(user, ctx).dataSync();
            ctx.products.forEach(product => {
                const productVector = encodeProduct(product, ctx).dataSync();

                const label = user.purchases.some(
                    purchase => purchase.name === product.name ? 1 : 0
                );

                // combinar user + product
                inputs.push([...userVector, ...productVector]);
                labels.push(label);
            });
        });


    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        // tamnho = userVector + productVector
        inputDimention: ctx.dimentions * 2,
    }
}

// Após a codificação, o modelo NÃO vê nomes ou palavras, mas apenas vetores de números.
// os vetores são todos normalizados entre 0 e 1
// Exemplo: [preço_normalizado, idade_normalizado, cat_one_hot..., cor_one_hot...]
//
// Suponha categories = ['acessórios', 'calçados', 'roupas']
// Suponha cores = ['preto', 'branco', 'vermelho']
//
// Para João (idade 25, categoria='roupas', cor='preto')
// userVector = [0.5, 0.25, 0, 0, 1, 0, 0]
//    - 0.5 = preço normalizado
//    - 0.25 = idade normalizada
//    - [0, 0, 1] = one hot para 'roupas'
//    - [1, 0, 0] = one hot para 'preto'

// Em resumo: 
// O modelo aprende quais combinação
async function configureNeutralNetAndTrain(trainData) {
    const model = tf.sequential();

    // inputShape: [trainData.inputDimention] - Define o formato dos dados de entrada (quantidade de características: preço, idade, etc.)
    // units: número de neurônios na camada
    // activation: função de ativação (relu - ativa a camada se o valor de entrada for maior que 0)
    model.add(tf.layers.dense({
        inputShape: [trainData.inputDimention],
        units: 128,
        activation: 'relu',
    }));

    // Camada intermediária para aumentar a capacidade do modelo de aprender padrões complexos. 
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
    }));

    // Camada intermediária para aumentar a capacidade do modelo de aprender padrões complexos. 
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
    }));

    // Camada de saída que produz a probabilidade de compra (entre 0 e 1).
    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid', // Comprime o resultado final para [0, 1], indicando a probabilidade de compra.
    }));

    model.compile({
        optimizer: tf.train.adam(0.01), // Algoritmo que ajusta os pesos da rede neural durante o treinamento para minimizar o erro.
        loss: 'binaryCrossentropy', //  usada para problemas de classificação binária (0 ou 1). Calcula a diferença entre as previsões e os rótulos verdadeiros, penalizando erros maiores de forma mais acentuada.
        metrics: ['accuracy'], //  mede a porcentagem de previsões corretas.
    })

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch + 1,
                    loss: logs.loss,
                    accuracy: logs.acc
                });
            },
            onTrainEnd: () => {
                postMessage({ type: workerEvents.trainingComplete });
            }
        }
    });

    return model;
}

async function trainModel({ users }) {
    console.log('Training model with users:', users)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });

    const products = await (await fetch('/data/products.json')).json();

    const ctx = makeContext(products, users);

    ctx.productVectors = products.map(product => {
        return {
            name: product.name,
            meta: { ...product },
            vector: encodeProduct(product, ctx)
                .dataSync()
        }
    });

    _globalCtx = ctx;

    const trainData = createTrainingData(ctx);
    _model = await configureNeutralNetAndTrain(trainData);

    postMessage({
        type: workerEvents.trainingLog,
        epoch: 1,
        loss: 1,
        accuracy: 1
    });

    setTimeout(() => {
        postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
        postMessage({ type: workerEvents.trainingComplete });
    }, 1000);
}

function recommend(user, ctx) {
    if (!_model) return;

    // 1️⃣ Converta o usuário fornecido no vetor de features codificadas
    //    (preço ignorado, idade normalizada, categorias ignoradas)
    //    Isso transforma as informações do usuário no mesmo formato numérico
    //    que foi usado para treinar o modelo.
    const userVector = encodeUser(user, ctx).dataSync();

    // Em aplicações reais:
    //  Armazene todos os vetores de produtos em um banco de dados vetorial (como Postgres, Neo4j ou Pinecone)
    //  Consulta: Encontre os 200 produtos mais próximos do vetor do usuário
    //  Execute _model.predict() apenas nesses produtos

    // 2️⃣ Crie pares de entrada: para cada produto, concatene o vetor do usuário
    //    com o vetor codificado do produto.
    //    Por quê? O modelo prevê o "score de compatibilidade" para cada par (usuário, produto).

    const inputs = ctx.productVectors.map(({ vector }) => [...userVector, ...vector]);

    // 3️⃣ Converta todos esses pares (usuário, produto) em um único Tensor.
    //    Formato: [numProdutos, inputDim]
    const inputTensor = tf.tensor2d(inputs);

    // 4️⃣ Rode a rede neural treinada em todos os pares (usuário, produto) de uma vez.
    //    O resultado é uma pontuação para cada produto entre 0 e 1.
    //    Quanto maior, maior a probabilidade do usuário querer aquele produto.
    const predictions = _model.predict(inputTensor);

    // 5️⃣ Extraia as pontuações para um array JS normal.
    const scores = predictions.dataSync();


    const recommendations = ctx.productVectors
        .map((p, i) => ({ ...p.meta, name: p.name, score: scores[i] }))

    const sortedItems = recommendations.sort((a, b) => b.score - a.score);


    // 8️⃣ Envie a lista ordenada de produtos recomendados
    // para a thread principal (a UI pode exibi-los agora).
    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems,
    });
}


const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: d => recommend(d.user, _globalCtx),
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
