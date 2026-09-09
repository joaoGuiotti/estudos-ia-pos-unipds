import { MongoClient } from 'mongodb'
import { dbConfig } from '../src/config.ts'
import { users } from './users.ts'

const isTestEnv = process.env.NODE_ENV === 'test'
const log = (...args: unknown[]) => {
  if (isTestEnv) return
  console.log(...args)
}

export async function runSeed() {
  const client = new MongoClient(dbConfig.dbURL)
  try {
    await client.connect()
    log(`Db connected successfully to ${dbConfig.dbName}!`)

    const db = client.db(dbConfig.dbName)
    const collection = db.collection(dbConfig.collection)

    await collection.deleteMany({})
    await Promise.all(users.map(i => collection.insertOne({ ...i })))

    log(await collection.find().toArray())
  } catch (err) {
    if (err instanceof Error) log(err.stack)
    else log(err)
  } finally {
    await client.close()
  }
}
