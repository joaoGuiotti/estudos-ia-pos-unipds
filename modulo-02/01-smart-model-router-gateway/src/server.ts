import { OpenRouterService } from "@services/open-router.service";
import Fastify from "fastify";

export const createServer = (routerService: OpenRouterService) => {
    const app = Fastify({ logger: false });

    app.post('/chat', {
        schema: {
            body: {
                type: 'object',
                required: ['question'],
                properties: {
                    question: {
                        type: 'string',
                        minLength: 1,
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { question } = request.body as { question: string };
            const response = await routerService.generate(question);
            reply.send(response);
        } catch (error) {
            console.error("Error processing request:", error);
            return reply.code(500);
        }
    });

    return app;
}