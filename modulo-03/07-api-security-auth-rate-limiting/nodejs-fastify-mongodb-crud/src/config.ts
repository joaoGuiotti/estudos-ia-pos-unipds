import { randomUUID } from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

export interface DbConfig {
  dbName: string
  collection: string
  dbURL: string
}

export interface AppConfig {
  port: number
  jwtSecret: string
  adminSuperSecret: string
  serviceTokenExpiryMinutes: number
  corsOrigin: string
  rateLimitAdmin: number
  rateLimitMember: number
  isTest: boolean
}

const randomName = randomUUID().slice(0, 4)

const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || 'example'
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || '27017'
const dbName = process.env.DB_NAME || `${randomName}-test`

export const dbConfig: DbConfig = {
  dbName,
  collection: 'customers',
  dbURL: `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}`,
}

export const appConfig: AppConfig = {
  port: Number(process.env.PORT) || 9999,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  adminSuperSecret: process.env.ADMIN_SUPER_SECRET || 'change-me-in-production',
  serviceTokenExpiryMinutes: Number(process.env.SERVICE_TOKEN_EXPIRY_MINUTES) || 60,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:9999',
  rateLimitAdmin: Number(process.env.RATE_LIMIT_ADMIN) || 90,
  rateLimitMember: Number(process.env.RATE_LIMIT_MEMBER) || 30,
  isTest: process.env.NODE_ENV === 'test',
}
