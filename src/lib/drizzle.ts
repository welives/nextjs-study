import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { schemas, SchemaType } from './schema'
import { DATABASE_URL } from '../config'

let db: NodePgDatabase<SchemaType>

export async function getConnection() {
  if (db) return db
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()
  db = drizzle(client, { schema: schemas })
  return db
}
