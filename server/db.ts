import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import * as schema from '@shared/schema';
import ws from 'ws';
import { sql } from 'drizzle-orm';

const isRailway = process.env.DATABASE_URL?.includes('railway.internal') || 
                   process.env.DATABASE_URL?.includes('railway.app') ||
                   process.env.RAILWAY_ENVIRONMENT !== undefined;

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;
let dbPool: NeonPool | PgPool;

if (isRailway) {
  dbPool = new PgPool({ connectionString: process.env.DATABASE_URL! });
  db = drizzlePg({ client: dbPool as PgPool, schema });
} else {
  neonConfig.webSocketConstructor = ws;
  dbPool = new NeonPool({ connectionString: process.env.DATABASE_URL! });
  db = drizzleNeon({ client: dbPool as NeonPool, schema });
}

async function runAutoMigrations() {
  try {
    await db.execute(sql`ALTER TABLE cover_designs ADD COLUMN IF NOT EXISTS logo_element JSONB`);
    console.log('[DB] Auto-migration: logo_element column ensured');
  } catch (error) {
    console.log('[DB] Auto-migration skipped or failed:', error);
  }
}

runAutoMigrations();

export { db };
