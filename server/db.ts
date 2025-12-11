import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import * as schema from '@shared/schema';
import ws from 'ws';

const isRailway = process.env.DATABASE_URL?.includes('railway.internal') || 
                   process.env.DATABASE_URL?.includes('railway.app') ||
                   process.env.RAILWAY_ENVIRONMENT !== undefined;

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isRailway) {
  const pool = new PgPool({ connectionString: process.env.DATABASE_URL! });
  db = drizzlePg({ client: pool, schema });
} else {
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL! });
  db = drizzleNeon({ client: pool, schema });
}

export { db };
