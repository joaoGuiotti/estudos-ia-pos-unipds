import Fastify from "fastify";
import { HumanMessage } from "langchain";
import { BuildGraph } from "./graph/graph.ts";

const graph = BuildGraph.build();

export const createServer = () => {
    const app = Fastify({ logger: false })

    app.post('/chat', {
        schema: {
            body: {
                type: 'object',
                required: ['question'],
                properties: {
                    question: { type: 'string', minLength: 5 }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { question } = request.body as { question: string };
            const response = await graph.invoke({
                messages: [new HumanMessage(question)]
            })
            return reply.send(response.output);
        } catch (error) {
            console.log('Error handling chat:', error);
            return reply.code(500).send({ error: 'Failed to process chat message' });
        }
    });

    return app;
}
