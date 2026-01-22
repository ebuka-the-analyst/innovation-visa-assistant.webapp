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
  
  // Update blog post image URLs to use object storage
  try {
    await db.execute(sql`
      UPDATE blog_posts 
      SET featured_image = REPLACE(featured_image, '/assets/blog/', '/objects/blog/') 
      WHERE featured_image LIKE '/assets/blog/%'
    `);
    console.log('[DB] Auto-migration: blog image URLs updated to object storage');
  } catch (error) {
    console.log('[DB] Blog URL migration skipped:', error);
  }
  
  // Fix blog posts with null featured_image
  try {
    const imageKeywords = [
      ["biometric", "/objects/blog/biometric-appointment.jpg"],
      ["interview", "/objects/blog/interview-preparation.jpg"],
      ["endorsement", "/objects/blog/compliance-endorsement.jpg"],
      ["document", "/objects/blog/documents-checklist.jpg"],
      ["business plan", "/objects/blog/business-plan.jpg"],
      ["business", "/objects/blog/business-meeting.jpg"],
      ["financial", "/objects/blog/financial-requirements.jpg"],
      ["family", "/objects/blog/family-visa.jpg"],
      ["settlement", "/objects/blog/settlement-ilr.jpg"],
      ["tax", "/objects/blog/tax-considerations.jpg"],
      ["grant", "/objects/blog/uk-grants.jpg"],
      ["company", "/objects/blog/company-registration.jpg"],
      ["innovation", "/objects/blog/innovation-scalability.jpg"],
      ["scalability", "/objects/blog/scalability-growth.jpg"],
      ["english", "/objects/blog/english-requirements.jpg"],
      ["visa", "/objects/blog/visa-process.jpg"],
      ["uk", "/objects/blog/uk-business.jpg"],
    ];
    
    const result = await db.execute(sql`SELECT id, title FROM blog_posts WHERE featured_image IS NULL`);
    const rows = (result as any).rows || result;
    
    if (Array.isArray(rows) && rows.length > 0) {
      let fixed = 0;
      for (const row of rows) {
        const titleLower = (row.title || "").toLowerCase();
        let newImage = "/objects/blog/uk-business.jpg";
        
        for (const [keyword, imagePath] of imageKeywords) {
          if (titleLower.includes(keyword)) {
            newImage = imagePath;
            break;
          }
        }
        
        await db.execute(sql`UPDATE blog_posts SET featured_image = ${newImage} WHERE id = ${row.id}`);
        fixed++;
      }
      console.log(`[DB] Auto-migration: Fixed ${fixed} blog posts with null images`);
    }
  } catch (error) {
    console.log('[DB] Blog image fix skipped:', error);
  }
}

runAutoMigrations();

export { db };
