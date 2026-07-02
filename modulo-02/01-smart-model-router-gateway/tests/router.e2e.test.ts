import { ModelConfig, modelConfig } from "@core/model-config.ts";
import assert from 'node:assert/strict';
import test from "node:test";
import { createServer } from "src/server.ts";
import { OpenRouterService, type LlmReposnse } from "src/services/open-router.service.ts";

const routerService = new OpenRouterService(modelConfig);
const app = createServer(routerService);

test.skip('Should routes to the cheaper model', async (t) => {
    const customConfig: ModelConfig = {
        ...modelConfig,
        maxTokens: 200,
        provider: {
            ...modelConfig.provider,
            sort: {
                by: 'price',
                partition: 'none'
            }
        }
    };

    const routerService = new OpenRouterService(customConfig);
    const app = createServer(routerService);

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: 'Qual é a sua origem?' }
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);

    const body = response.json() as LlmReposnse;

    assert.match(body.model, /^poolside\/laguna-xs.*:free$/);
});

test('Should routes to the throughput model', async (t) => {
    const customConfig: ModelConfig = {
        ...modelConfig,
        maxTokens: 200,
        provider: {
            ...modelConfig.provider,
            sort: {
                by: 'throughput',
                partition: 'none'
            }
        }
    };

    const routerService = new OpenRouterService(customConfig);
    const app = createServer(routerService);

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: 'Qual é a sua origem?' }
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);

    const body = response.json() as LlmReposnse;

    assert.match(body.model, /^poolside\/laguna-xs.*:free$/);
});