import { env } from "@env";
import { OpenRouterService } from "@services/open-router.service.ts";
import { createServer } from "./server.ts";
import { modelConfig } from "./core/model-config.ts";

const routerService = new OpenRouterService(modelConfig);
const app = createServer(routerService);

await app.listen({ port: env.PORT, host: '0.0.0.0' });

app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: 'Qual é a sua origem?' }
}).then((response) => {
    console.log('Reponse Stauts', response.statusCode);
    console.log('Reponse Body', response.body);
}); 