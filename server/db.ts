import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from '@shared/schema';
import ws from 'ws';

// Check if we're connecting to Railway (non-Neon) database
const isRailwayDb = process.env.DATABASE_URL?.includes('railway') || 
                    process.env.DATABASE_URL?.includes('rlwy.net');

let db: ReturnType<typeof drizzleNeon<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

if (isRailwayDb) {
  // Use standard pg driver for Railway PostgreSQL
  const pool = new pg.Pool({ 
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
  });
  db = drizzlePg({ client: pool, schema });
} else {
  // Use Neon serverless driver with WebSocket for Neon databases
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL! });
  db = drizzleNeon({ client: pool, schema });
}

export { db };
