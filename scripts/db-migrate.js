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
    
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
