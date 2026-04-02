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

  // Blog posts: scheduling + AI verification columns (added after initial deployment)
  const blogMigrations: Array<{ col: string; ddl: string }> = [
    { col: 'post_status',             ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS post_status VARCHAR(20) NOT NULL DEFAULT 'published'` },
    { col: 'scheduled_for',           ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP` },
    { col: 'generated_at',            ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP` },
    { col: 'is_auto_generated',       ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN NOT NULL DEFAULT false` },
    { col: 'was_edited',              ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS was_edited BOOLEAN NOT NULL DEFAULT false` },
    { col: 'edited_at',               ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP` },
    { col: 'edited_by',               ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS edited_by VARCHAR` },
    { col: 'original_content',        ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS original_content TEXT` },
    { col: 'likes',                   ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0` },
    { col: 'shares',                  ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS shares INTEGER NOT NULL DEFAULT 0` },
    { col: 'comments',                ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comments INTEGER NOT NULL DEFAULT 0` },
    { col: 'avg_time_on_page',        ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS avg_time_on_page INTEGER NOT NULL DEFAULT 0` },
    { col: 'bounce_rate',             ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS bounce_rate REAL NOT NULL DEFAULT 0` },
    { col: 'social_shares',           ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_shares JSONB` },
    { col: 'google_ranking',          ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS google_ranking INTEGER` },
    { col: 'organic_traffic',         ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS organic_traffic INTEGER NOT NULL DEFAULT 0` },
    { col: 'click_through_rate',      ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS click_through_rate REAL NOT NULL DEFAULT 0` },
    { col: 'word_count',              ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INTEGER NOT NULL DEFAULT 0` },
    { col: 'readability_score',       ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS readability_score REAL` },
    { col: 'seo_score',               ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER` },
    { col: 'ai_verification_score',   ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_verification_score INTEGER` },
    { col: 'gemini_score',            ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS gemini_score INTEGER` },
    { col: 'openai_score',            ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS openai_score INTEGER` },
    { col: 'qwen_score',              ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS qwen_score INTEGER` },
    { col: 'claude_score',            ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS claude_score INTEGER` },
    { col: 'verification_status',     ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'` },
    { col: 'verification_details',    ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_details JSONB` },
    { col: 'verified_at',             ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP` },
    { col: 'verification_expires_at', ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP` },
    { col: 'human_review_required',   ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS human_review_required BOOLEAN NOT NULL DEFAULT false` },
    { col: 'contradiction_flags',     ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS contradiction_flags INTEGER NOT NULL DEFAULT 0` },
    { col: 'sources_cited',           ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sources_cited INTEGER NOT NULL DEFAULT 0` },
    { col: 'content_hash',            ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_hash TEXT` },
    { col: 'author_bio',              ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT` },
    { col: 'meta_title',              ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT` },
    { col: 'meta_description',        ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT` },
    { col: 'meta_keywords',           ddl: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_keywords TEXT[]` },
  ];

  let migratedCount = 0;
  for (const { col, ddl } of blogMigrations) {
    try {
      await db.execute(sql.raw(ddl));
      migratedCount++;
    } catch {
      // Column already exists or other harmless error — skip silently
    }
  }
  if (migratedCount > 0) {
    console.log(`[DB] Auto-migration: ${migratedCount} blog_posts column(s) ensured`);
  }

  // blog_generation_queue table — create if missing, then add any missing columns
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS blog_generation_queue (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        target_date TIMESTAMP NOT NULL DEFAULT NOW(),
        topic TEXT,
        category VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        generated_post_id VARCHAR,
        generation_started_at TIMESTAMP,
        generation_completed_at TIMESTAMP,
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `));
    console.log('[DB] Auto-migration: blog_generation_queue table ensured');
  } catch {
    // Table already exists — skip
  }

  // Ensure individual columns on blog_generation_queue in case table pre-existed without them
  const queueMigrations: string[] = [
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS target_date TIMESTAMP NOT NULL DEFAULT NOW()`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS topic TEXT`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generated_post_id VARCHAR`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP`,
    `ALTER TABLE blog_generation_queue ADD COLUMN IF NOT EXISTS error TEXT`,
  ];
  for (const ddl of queueMigrations) {
    try { await db.execute(sql.raw(ddl)); } catch { /* already exists */ }
  }
  console.log('[DB] Auto-migration: blog_generation_queue columns ensured');
  
  // business_plans: toc_style override column (added Apr 2026)
  try {
    await db.execute(sql.raw(`ALTER TABLE business_plans ADD COLUMN IF NOT EXISTS toc_style INTEGER`));
    console.log('[DB] Auto-migration: business_plans.toc_style column ensured');
  } catch { /* already exists */ }

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
