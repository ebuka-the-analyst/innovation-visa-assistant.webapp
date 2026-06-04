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

  // floating_feedback: rating column (added Jun 2026)
  try {
    await db.execute(sql.raw(`ALTER TABLE floating_feedback ADD COLUMN IF NOT EXISTS rating INTEGER`));
    console.log('[DB] Auto-migration: floating_feedback.rating column ensured');
  } catch { /* already exists */ }

  // export_analytics table (added Jun 2026)
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS export_analytics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        plan_id VARCHAR NOT NULL,
        user_id VARCHAR NOT NULL,
        export_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'started',
        export_time_ms INTEGER,
        pages_count INTEGER,
        file_size_bytes INTEGER,
        charts_expected INTEGER DEFAULT 0,
        charts_embedded INTEGER DEFAULT 0,
        missing_charts TEXT[],
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        error_code VARCHAR(50),
        error_message TEXT,
        failure_stage VARCHAR(50)
      )
    `));
    console.log('[DB] Auto-migration: export_analytics table ensured');
  } catch { /* already exists */ }

  // conversion_funnel_events table (added Jun 2026)
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS conversion_funnel_events (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR,
        session_id VARCHAR(100),
        funnel_name VARCHAR(100) NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        step_index INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        dropped_off BOOLEAN NOT NULL DEFAULT false,
        time_spent_seconds INTEGER,
        entry_source VARCHAR(100),
        device_type VARCHAR(20),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `));
    console.log('[DB] Auto-migration: conversion_funnel_events table ensured');
  } catch { /* already exists */ }

  // hourly_activity_aggregates table (added Jun 2026)
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS hourly_activity_aggregates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        hour_timestamp TIMESTAMP NOT NULL,
        active_users INTEGER NOT NULL DEFAULT 0,
        new_users INTEGER NOT NULL DEFAULT 0,
        page_views INTEGER NOT NULL DEFAULT 0,
        events INTEGER NOT NULL DEFAULT 0,
        tool_runs INTEGER NOT NULL DEFAULT 0,
        plans_created INTEGER NOT NULL DEFAULT 0,
        plans_completed INTEGER NOT NULL DEFAULT 0,
        exports INTEGER NOT NULL DEFAULT 0,
        revenue REAL NOT NULL DEFAULT 0,
        errors INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `));
    console.log('[DB] Auto-migration: hourly_activity_aggregates table ensured');
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
  // IMPORTANT: Always use /objects/blog/unique/ paths (not /assets/) — these are routed correctly everywhere
  try {
    const allUniqueImages = [
      "/objects/blog/unique/biometric-scan-1.png",
      "/objects/blog/unique/endorsement-maintenance.png",
      "/objects/blog/unique/meeting-prep-1.png",
      "/objects/blog/unique/contact-meeting-1.png",
      "/objects/blog/unique/companies-house-1.png",
      "/objects/blog/unique/bank-account-1.png",
      "/objects/blog/unique/visa-center-waiting.png",
      "/objects/blog/unique/scalability-chart-1.png",
      "/objects/blog/unique/english-test-prep.png",
      "/objects/blog/unique/visa-documents-spread.png",
      "/objects/blog/unique/endorsing-body-meeting.png",
      "/objects/blog/unique/tax-consultation.png",
      "/objects/blog/unique/endorsement-compliance.png",
      "/objects/blog/unique/financial-projections.png",
      "/objects/blog/unique/endorsement-review-1.png",
      "/objects/blog/unique/grant-funding-success.png",
      "/objects/blog/unique/online-banking-setup.png",
      "/objects/blog/unique/endorsement-warning.png",
      "/objects/blog/unique/documents-organized.png",
      "/objects/blog/unique/documents-checklist-1.png",
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
