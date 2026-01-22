import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  const client = new pg.Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected successfully');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '0000_secret_patch.sql');
    let sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Remove drizzle statement breakpoints
    sql = sql.replace(/--> statement-breakpoint/g, '');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        await client.query(trimmed + ';');
        successCount++;
      } catch (err) {
        // Skip if table/index already exists
        if (err.code === '42P07' || err.code === '42710') {
          skipCount++;
        } else {
          console.error(`Error executing: ${trimmed.substring(0, 50)}...`);
          console.error(err.message);
        }
      }
    }
    
    console.log(`Migration complete: ${successCount} executed, ${skipCount} skipped (already exist)`);
    
    // Add chart_data column to business_plans if not exists
    try {
      await client.query(`
        ALTER TABLE business_plans 
        ADD COLUMN IF NOT EXISTS chart_data TEXT
      `);
      console.log('chart_data column added or already exists');
    } catch (err) {
      if (err.code !== '42701') { // 42701 = column already exists
        console.error('Error adding chart_data column:', err.message);
      }
    }
    
    // Add theme columns to business_plans if not exists
    const themeColumns = [
      { name: 'theme_id', type: 'VARCHAR(50)' },
      { name: 'theme_primary_color', type: 'VARCHAR(20)' },
      { name: 'theme_secondary_color', type: 'VARCHAR(20)' },
      { name: 'theme_font', type: 'VARCHAR(50)' },
      { name: 'theme_applied_at', type: 'TIMESTAMP' },
      { name: 'background_image', type: 'TEXT' },
      { name: 'use_full_cover_image', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'text_elements', type: 'TEXT' }
    ];
    
    for (const col of themeColumns) {
      try {
        await client.query(`
          ALTER TABLE business_plans 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
        console.log(`${col.name} column added or already exists`);
      } catch (err) {
        if (err.code !== '42701') { // 42701 = column already exists
          console.error(`Error adding ${col.name} column:`, err.message);
        }
      }
    }
    
    // Create cover_designs table if not exists
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS cover_designs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          theme_id VARCHAR(50),
          primary_color VARCHAR(20),
          secondary_color VARCHAR(20),
          font VARCHAR(50),
          background_image TEXT,
          use_full_cover_image BOOLEAN NOT NULL DEFAULT FALSE,
          text_elements JSONB,
          palette_id VARCHAR(50),
          palette_colors JSONB,
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          name VARCHAR(100),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('cover_designs table created or already exists');
      
      // Create indexes for cover_designs
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_cover_user ON cover_designs(user_id)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_cover_default ON cover_designs(user_id, is_default)
      `);
      console.log('cover_designs indexes created or already exist');
    } catch (err) {
      if (err.code !== '42P07') { // 42P07 = table already exists
        console.error('Error creating cover_designs table:', err.message);
      }
    }
    
    // Create premium_cover_purchases table if not exists
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS premium_cover_purchases (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          template_id VARCHAR(100) NOT NULL,
          price INTEGER NOT NULL,
          stripe_payment_intent_id VARCHAR(255),
          stripe_session_id VARCHAR(255),
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          purchased_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('premium_cover_purchases table created or already exists');
      
      // Create indexes for premium_cover_purchases
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_premium_cover_user ON premium_cover_purchases(user_id)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_premium_cover_template ON premium_cover_purchases(user_id, template_id)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_premium_cover_stripe ON premium_cover_purchases(stripe_session_id)
      `);
      console.log('premium_cover_purchases indexes created or already exist');
    } catch (err) {
      if (err.code !== '42P07') { // 42P07 = table already exists
        console.error('Error creating premium_cover_purchases table:', err.message);
      }
    }
    
    // Create blog_posts table if not exists
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          tags TEXT[],
          meta_title TEXT,
          meta_description TEXT,
          meta_keywords TEXT[],
          featured_image TEXT,
          reading_time INTEGER NOT NULL DEFAULT 5,
          author VARCHAR(100) NOT NULL DEFAULT 'UK Visa Expert',
          author_bio TEXT,
          is_published BOOLEAN NOT NULL DEFAULT TRUE,
          is_featured BOOLEAN NOT NULL DEFAULT FALSE,
          views INTEGER NOT NULL DEFAULT 0,
          published_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('blog_posts table created or already exists');
      
      // Create indexes for blog_posts
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog_posts(is_featured, published_at DESC)
      `);
      console.log('blog_posts indexes created or already exist');
    } catch (err) {
      if (err.code !== '42P07') { // 42P07 = table already exists
        console.error('Error creating blog_posts table:', err.message);
      }
    }
    
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
