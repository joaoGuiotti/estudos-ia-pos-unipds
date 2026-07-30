import { randomUUID } from 'node:crypto';
import { REQUESTS_PER_MINUTE } from './config.js';

export const Roles = Object.freeze({
    Admin: 'admin',
    Member: 'member'
});

export const authUsers = [{
    username: 'erickwendel',
    password: '123123',
    role: Roles.Admin,
},
{
    username: 'ananeri',
    password: '1234',
    role: Roles.Member
}]

// Returns the token from the Authorization header, or null if not present
export const getHeaderAuthorizationToken = (request) => {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        return null;
    }

    const token = authHeader.replace(/bearer/i, '').trim();
    return token || null;
};

export const JWT_SECRET = 'mysecretkey'
export const ADMIN_SUPER_SECRET = 'AM I THE BOSS?';
const issuedServiceTokens = new Map();

export const rateLimitOptions = {
    max: REQUESTS_PER_MINUTE,
    timeWindow: '1 minute',
    keyGenerator: (request) => getHeaderAuthorizationToken(request) ?? request.ip,
}

export function initAuthRoutes(fastify) {
    fastify.addHook('onRequest', async (request, reply) => {
        const publicRoutes = [
            '/v1/health',
            '/v1/auth/login',
            '/v1/auth/service-token',
        ];

        if (publicRoutes.includes(request.originalUrl)) {
            return;
        }

        const token = getHeaderAuthorizationToken(request);
        const serviceTokenData = issuedServiceTokens.get(token);

        if (serviceTokenData) {
            request.user = serviceTokenData;
            return;
        }

        try {
            await request.jwtVerify();
        } catch (error) {
            console.error('[onRequest]: Unauthorized access attempt:', error);
            return reply.code(401).send({ message: 'Unauthorized' });
        }
    })

    fastify.post(
        '/v1/auth/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string' },
                        password: { type: 'string' },
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                        401: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                            }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { username, password } = request.body
            const user = authUsers.find(
                (candidate) =>
                    candidate.username.toLocaleLowerCase() === username.toLocaleLowerCase() &&
                    candidate.password === password
            )

            if (!user) {
                return reply.code(401).send({ message: 'Invalid credentials' })
            }

            const token = await reply.jwtSign({ username: user.username, role: user.role })
            return reply.code(200).send({ token })
        })

    fastify.post(
        '/v1/auth/service-token',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['username', 'password', 'adminSuperSecret'],
                    properties: {
                        username: { type: 'string' },
                        password: { type: 'string' },
                        adminSuperSecret: { type: 'string' },
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            serviceToken: { type: 'string' },
                            role: { type: 'string' },
                        },
                        401: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                            }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { username, password, adminSuperSecret } = request.body

            if (adminSuperSecret !== ADMIN_SUPER_SECRET) {
                return reply.code(401).send({ message: 'Invalid admin super secret' })
            }

            const user = authUsers.find(
                (candidate) =>
                    candidate.username.toLocaleLowerCase() === username.toLocaleLowerCase() &&
                    candidate.password === password
            )

            if (!user) {
                return reply.code(401).send({ message: 'Invalid credentials' })
            }

            const serviceToken = randomUUID();

            issuedServiceTokens.set(serviceToken, { username: user.username, role: user.role });

            return reply.code(200).send({ serviceToken, role: user.role });
        })
}

export const requiredRole = (role) => async (request, reply) => {
    if (request.user && request.user.role === role) {
        return;
    } else {
        return reply.code(403).send({
            message: 'Forbidden: Insufficient permissions'
        });
    }
}
