import { ObjectId } from 'mongodb'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from '../db.ts'
import { Roles, requiredRole } from '../auth.ts'

export function registerCustomerRoutes(fastify: FastifyInstance): void {
  fastify.get('/v1/customers', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (_request, reply) => {
    const { collections } = await getDb()
    const customers = await collections.dbUsers
      .find({})
      .sort({ name: 1 })
      .toArray()
    return reply.code(200).send(customers)
  })

  fastify.get('/v1/customers/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const { collections } = await getDb()
    const user = await collections.dbUsers.findOne({ _id: new ObjectId(id) } as any)

    if (!user) {
      return reply.code(404).send({ message: 'User not found', id })
    }

    const { _id, ...rest } = user as { _id: ObjectId } & typeof user
    return reply.code(200).send({ id: _id.toString(), ...rest })
  })

  fastify.post('/v1/customers', {
    preHandler: [requiredRole(Roles.Admin)],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'phone'],
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, phone } = request.body as { name: string; phone: string }
    const { collections } = await getDb()
    const result = await collections.dbUsers.insertOne({ name, phone })
    return reply.code(201).send({ message: `user ${name} created!`, id: result.insertedId.toString() })
  })

  fastify.put('/v1/customers/:id', {
    preHandler: [requiredRole(Roles.Admin)],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['name', 'phone'],
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { name, phone } = request.body as { name: string; phone: string }

    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const { collections } = await getDb()
    const result = await collections.dbUsers.updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { name, phone } },
    )

    if (!result.modifiedCount) {
      return reply.code(404).send({ message: 'User not found or no changes made', id })
    }

    return reply.code(200).send({ message: `User ${id} updated!`, id })
  })

  fastify.delete('/v1/customers/:id', {
    preHandler: [requiredRole(Roles.Admin)],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const { collections } = await getDb()
    const result = await collections.dbUsers.deleteOne({ _id: new ObjectId(id) } as any)

    if (!result.deletedCount) {
      return reply.code(404).send({ message: 'User not found' })
    }

    return reply.code(200).send({ message: `User ${id} deleted!`, id })
  })
}
