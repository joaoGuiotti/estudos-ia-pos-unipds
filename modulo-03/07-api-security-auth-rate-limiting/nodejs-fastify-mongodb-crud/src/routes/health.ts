import type { FastifyInstance } from 'fastify'

export function registerHealthRoute(fastify: FastifyInstance): void {
  fastify.get('/v1/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            app: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.code(200).send({ app: 'customers', version: 'v1.0.1' })
  })
}
