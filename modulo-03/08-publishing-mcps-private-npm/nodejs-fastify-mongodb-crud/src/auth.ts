import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from './db.ts'
import { appConfig } from './config.ts'

export const Roles = {
  Admin: 'admin' as const,
  Member: 'member' as const,
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

export function getHeaderAuthorizationToken(request: FastifyRequest): string | null {
  const authHeader = request.headers['authorization']
  if (!authHeader) return null
  return authHeader.replace(/bearer/i, '').trim() || null
}

export async function seedUsers(): Promise<void> {
  const { collections } = await getDb()
  const existing = await collections.authUsers.countDocuments()
  if (existing > 0) return

  const adminHash = await bcrypt.hash('123123', 10)
  const memberHash = await bcrypt.hash('1234', 10)

  await collections.authUsers.insertMany([
    { username: 'erickwendel', password: adminHash, role: 'admin', createdAt: new Date() },
    { username: 'ananeri', password: memberHash, role: 'member', createdAt: new Date() },
  ])

  console.log('Default users seeded')
}

export async function findUser(username: string, password: string) {
  const { collections } = await getDb()
  const user = await collections.authUsers.findOne({ username: username.toLowerCase() })
  if (!user) return null
  const match = await bcrypt.compare(password, user.password)
  if (!match) return null
  return { username: user.username, role: user.role }
}

export async function issueServiceToken(username: string, role: Role): Promise<{ serviceToken: string; expiresAt: Date }> {
  const { collections } = await getDb()
  const token = randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + appConfig.serviceTokenExpiryMinutes * 60 * 1000)

  await collections.serviceTokens.insertOne({
    token,
    username,
    role,
    createdAt: now,
    expiresAt,
  })

  return { serviceToken: token, expiresAt }
}

export async function refreshServiceToken(oldToken: string): Promise<{ serviceToken: string; expiresAt: Date } | null> {
  const { collections } = await getDb()
  const existing = await collections.serviceTokens.findOne({ token: oldToken })
  if (!existing || existing.expiresAt < new Date()) return null

  await collections.serviceTokens.deleteOne({ token: oldToken })
  return issueServiceToken(existing.username, existing.role)
}

export async function validateServiceToken(token: string): Promise<{ username: string; role: Role } | null> {
  const { collections } = await getDb()
  const doc = await collections.serviceTokens.findOne({ token, expiresAt: { $gt: new Date() } })
  if (!doc) return null
  return { username: doc.username, role: doc.role }
}

export function initAuthRoutes(fastify: FastifyInstance): void {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const publicRoutes = [
      '/v1/health',
      '/v1/auth/login',
      '/v1/auth/service-token',
    ]

    if (publicRoutes.includes(request.originalUrl)) {
      return
    }

    const token = getHeaderAuthorizationToken(request)

    if (token) {
      const serviceTokenData = await validateServiceToken(token)
      if (serviceTokenData) {
        request.user = serviceTokenData
        return
      }
    }

    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
  })

  fastify.post('/v1/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: { token: { type: 'string' } },
        },
        401: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { username: string; password: string } }>, reply: FastifyReply) => {
    const { username, password } = request.body
    const user = await findUser(username, password)

    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' })
    }

    const token = await reply.jwtSign({ username: user.username, role: user.role })
    return reply.code(200).send({ token })
  })

  fastify.post('/v1/auth/service-token', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password', 'adminSuperSecret'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          adminSuperSecret: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            serviceToken: { type: 'string' },
            role: { type: 'string' },
            expiresAt: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { username: string; password: string; adminSuperSecret: string } }>, reply: FastifyReply) => {
    const { username, password, adminSuperSecret } = request.body

    if (adminSuperSecret !== appConfig.adminSuperSecret) {
      return reply.code(401).send({ message: 'Invalid admin super secret' })
    }

    const user = await findUser(username, password)
    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' })
    }

    const { serviceToken, expiresAt } = await issueServiceToken(user.username, user.role)
    return reply.code(200).send({ serviceToken, role: user.role, expiresAt: expiresAt.toISOString() })
  })

  fastify.post('/v1/auth/service-token/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['serviceToken'],
        properties: {
          serviceToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            serviceToken: { type: 'string' },
            expiresAt: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { serviceToken: string } }>, reply: FastifyReply) => {
    const result = await refreshServiceToken(request.body.serviceToken)
    if (!result) {
      return reply.code(401).send({ message: 'Invalid or expired service token' })
    }
    return reply.code(200).send({ serviceToken: result.serviceToken, expiresAt: result.expiresAt.toISOString() })
  })
}

export const requiredRole = (role: Role) => async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as { username: string; role: Role } | undefined
  if (user && user.role === role) {
    return
  }
  return reply.code(403).send({ message: 'Forbidden: Insufficient permissions' })
}
