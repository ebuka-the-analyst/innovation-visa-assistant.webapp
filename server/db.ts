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
  
  // Assign unique images to each blog post - ensures NO duplicates
  try {
    const allUniqueImages = [
      "/assets/blog/unique/biometric-scan-1.png",
      "/assets/blog/unique/endorsement-maintenance.png",
      "/assets/blog/unique/meeting-prep-1.png",
      "/assets/blog/unique/contact-meeting-1.png",
      "/assets/blog/unique/companies-house-1.png",
      "/assets/blog/unique/bank-account-1.png",
      "/assets/blog/unique/visa-center-waiting.png",
      "/assets/blog/unique/scalability-chart-1.png",
      "/assets/blog/unique/english-test-prep.png",
      "/assets/blog/unique/visa-documents-spread.png",
      "/assets/blog/unique/endorsing-body-meeting.png",
      "/assets/blog/unique/tax-consultation.png",
      "/assets/blog/unique/endorsement-compliance.png",
      "/assets/blog/unique/financial-projections.png",
      "/assets/blog/unique/endorsement-review-1.png",
      "/assets/blog/unique/grant-funding-success.png",
      "/assets/blog/unique/online-banking-setup.png",
      "/assets/blog/unique/endorsement-warning.png",
      "/assets/blog/unique/documents-organized.png",
      "/assets/blog/unique/documents-checklist-1.png",
    ];

    const result = await db.execute(sql`SELECT id, featured_image FROM blog_posts ORDER BY created_at ASC`);
    const rows = (result as any).rows || result;
    
    if (Array.isArray(rows) && rows.length > 0) {
      let fixed = 0;
      const usedImages = new Set<string>();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const currentImage = row.featured_image || "";
        
        // Skip if already has a unique image that's not used elsewhere
        if (currentImage.includes("/unique/") && !usedImages.has(currentImage)) {
          usedImages.add(currentImage);
          continue;
        }
        
        // Assign next available unique image
        for (const img of allUniqueImages) {
          if (!usedImages.has(img)) {
            usedImages.add(img);
            await db.execute(sql`UPDATE blog_posts SET featured_image = ${img} WHERE id = ${row.id}`);
            fixed++;
            break;
          }
        }
      }
      if (fixed > 0) {
        console.log(`[DB] Auto-migration: Assigned unique images to ${fixed} blog posts`);
      }
    }
  } catch (error) {
    console.log('[DB] Blog unique image assignment skipped:', error);
  }
}

runAutoMigrations();

export { db };
