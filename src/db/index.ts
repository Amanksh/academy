import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:8580@localhost:5432/mudra'

const client = postgres(connectionString, {
  max: 5, // Limit connection pool to prevent Supabase EMAXCONNSESSION limits
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for Supabase connection poolers
})

export const db = drizzle(client, { schema })

