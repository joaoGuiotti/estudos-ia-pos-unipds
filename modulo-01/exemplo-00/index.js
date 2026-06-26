import tf from '@tensorflow/tfjs';


async function trainModel(inputXs, outputYs) {
    const model = tf.sequential();

    // Primeira camada da rede:
    // entrada de 7 posições (idade normalizada +  3 cores + 3 localizações)

    // 80 neuronios = aqui coloquei tudo isso, por que tem pouca base de treino
    // quanto mais neuronios, mais complexidadde a rede pode aprender
    // e consequentemente, mais procesaemnto ele vai usar

    // A ReLU age como um filtro:
    // É como se ela deixasse apenas os dados interresantes seguirem viagen na rede
    // Se a informção chegou nesse neuronio é positiva passa pra frente!
    // se for 0 ou negativo, pode jogar fora, não vai servir para nada
    model.add(tf.layers.dense({ inputShape: [7], units: 80, activation: 'relu' }))

    // Saida: 3 neuronios
    //  Um para cada categoria(premium, medium, basic)

    // Activation: softmax normaliza nosso a saida de probalidades
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }))

    // Compilando o modelo
    // Optimizer Adam (Adaptive Moment Estimation)
    //  Ajusta Pessos de forma eficiente e inteligente
    //  Aprende com proprio historico de erros

    // loss: categoricalCrossentropy
    // Ele comapra o que o modelo "acha" (os scores de cada categoria)
    //  a cada categoria premium sera sempre [1, 0, 0]

    // Quanto mais distante da previsãp do modelo de resposta correta
    //  maior o erro
    // Exemplo classico: Classificação de imgs, recomendações, cateogrização de usuários

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] })

    // Treinamento do modelo
    // Verbose: Desabilita o log interno( e usa só callback)
    // epocs: Quantidae de vezes que vai rodar no dataset
    // shurfle: Embaralha os dados, para evitar viés
    await model.fit(inputXs, outputYs, {
        verbose: 0, epochs: 100, shuffle: true, callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
        }
    })


    return model
}

async function predict(model, pessoa) {
    // Transformar array js apra tensor
    const tfInput = tf.tensor2d(pessoa);

    const pred = model.predict(tfInput);
    const predArray = await pred.array();

    console.log(predArray);

    return predArray[0].map((prob, index) => ({ prob, index }));
}

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
// const tensorPessoas = [
//     [0.33, 1, 0, 0, 1, 0, 0], // Erick
//     [0, 0, 1, 0, 0, 1, 0],    // Ana
//     [1, 0, 0, 1, 0, 0, 1]     // Carlos
// ]

// Usamos apenas os dados numéricos, como a rede neural só entende números.
// tensorPessoasNormalizado corresponde ao dataset de entrada do modelo.
const tensorPessoasNormalizado = [
    [0.33, 1, 0, 0, 1, 0, 0], // Erick
    [0, 0, 1, 0, 0, 1, 0],    // Ana
    [1, 0, 0, 1, 0, 0, 1]     // Carlos
]

// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
    [1, 0, 0], // premium - Erick
    [0, 1, 0], // medium - Ana
    [0, 0, 1]  // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado)
const outputYs = tf.tensor2d(tensorLabels)

// Quanto mais dados melhor, assim o algoritmo consegue entender melhor os padrões complexos dos dados
const model = await trainModel(inputXs, outputYs)

const pessoa = { nome: 'Zé', cor: 'verde', localizacao: 'Curitiba' }

// Normalizando a idadde da nova pessoa usando o mesmo padrão do treinamento
// exemplo: idade_min = 25, idade_max: 40, então (28 - 25) / (40 - 25) = 0.2
const pessoaTensorNormalizado = [
    [
        0.2, // idade normalizada
        1,   // cor azul
        0,   // cor vermelho
        0,   // cor verde
        0,   // Loca São Paulo
        1,   // Loca Rio
        0,    // Loca Curitiba
    ]
]


const predictions = await predict(model, pessoaTensorNormalizado)
const results = predictions
    .sort((a, b) => b.prod - a.prod)
    .map(p => `${labelsNomes[p.index]} (${(p.prob * 100).toFixed(2)}%)`)
    .join('\n')

console.log(results);

