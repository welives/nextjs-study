import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { schemas } from './schema'
import { __DEV__ } from '../config'

const client = new pg.Client({ connectionString: process.env.DATABASE_DSN })
await client.connect()
export default drizzle(client, { schema: schemas })
