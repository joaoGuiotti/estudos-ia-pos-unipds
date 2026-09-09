import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { appConfig } from './config.ts'
import { getDb, closeDb } from './db.ts'
import { initAuthRoutes, seedUsers, getHeaderAuthorizationToken } from './auth.ts'
import { registerHealthRoute } from './routes/health.ts'
import { registerCustomerRoutes } from './routes/customers.ts'

if (!appConfig.isTest && !process.env.DB_NAME) {
  console.error('[error*****]: please, pass DB_NAME env before running it!')
  process.exit(1)
}

const fastify = Fastify({
  logger: {
    level: appConfig.isTest ? 'silent' : 'info',
    redact: ['req.headers.authorization'],
  },
  trustProxy: true,
})

await fastify.register(fastifyHelmet)
await fastify.register(fastifyCors, {
  origin: appConfig.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Customers API',
      description: 'CRUD API with JWT and Service Token authentication',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${appConfig.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

await fastify.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

await fastify.register(fastifyJwt, { secret: appConfig.jwtSecret })

await fastify.register(fastifyRateLimit, {
  max: appConfig.rateLimitAdmin,
  timeWindow: '1 minute',
  keyGenerator: (request) => {
    const token = getHeaderAuthorizationToken(request)
    if (token) return `token:${token}`
    return request.ip
  },
})

initAuthRoutes(fastify)
registerHealthRoute(fastify)
registerCustomerRoutes(fastify)

await seedUsers()

fastify.addHook('onClose', async () => {
  console.log('server closed!')
  await closeDb()
})

if (!appConfig.isTest) {
  const serverInfo = await fastify.listen({
    port: appConfig.port,
    host: '::',
  })
  console.log(`server is running at ${serverInfo}`)
}

export const server = fastify
