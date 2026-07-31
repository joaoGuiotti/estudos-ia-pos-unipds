import { MongoClient, Collection, type Db } from 'mongodb'
import { dbConfig } from './config.ts'

export interface UserDoc {
  _id?: string
  username: string
  password: string
  role: 'admin' | 'member'
  createdAt: Date
}

export interface CustomerDoc {
  name: string
  phone: string
}

export interface ServiceTokenDoc {
  _id?: string
  token: string
  username: string
  role: 'admin' | 'member'
  createdAt: Date
  expiresAt: Date
}

export interface DbCollections {
  dbUsers: Collection<CustomerDoc>
  authUsers: Collection<UserDoc>
  serviceTokens: Collection<ServiceTokenDoc>
}

interface ConnectResult {
  collections: DbCollections
  dbClient: MongoClient
  db: Db
}

async function connect(): Promise<ConnectResult> {
  const dbClient = new MongoClient(dbConfig.dbURL)
  const db = dbClient.db(dbConfig.dbName)
  const dbUsers = db.collection<CustomerDoc>(dbConfig.collection)
  const authUsers = db.collection<UserDoc>('users')
  const serviceTokens = db.collection<ServiceTokenDoc>('service_tokens')

  await dbUsers.createIndex({ name: 1 })
  await authUsers.createIndex({ username: 1 }, { unique: true })
  await serviceTokens.createIndex({ token: 1 }, { unique: true })
  await serviceTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

  console.log('Connected to the database')

  return { collections: { dbUsers, authUsers, serviceTokens }, dbClient, db }
}

let _cached: ConnectResult | null = null

export async function getDb(): Promise<ConnectResult> {
  if (!_cached) {
    _cached = await connect()
  }
  return _cached
}

export async function closeDb(): Promise<void> {
  if (_cached) {
    await _cached.dbClient.close()
    _cached = null
  }
}
