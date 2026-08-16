const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[APP MIGRATIONS] DATABASE_URL is required');
  process.exit(1);
}

const migrationDir = path.resolve(process.cwd(), 'migrations', 'app');
const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function main() {
  if (!fs.existsSync(migrationDir)) {
    throw new Error(`[APP MIGRATIONS] Migration directory not found: ${migrationDir}`);
  }

  const files = fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  const applied = [];
  const skipped = [];

  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '10min'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('innovator-founder-app-schema-migrations'))");

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        checksum_sha256 VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (const file of files) {
      const fullPath = path.join(migrationDir, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      const checksum = sha256(sql);
      const existing = await client.query(
        'SELECT checksum_sha256 FROM app_schema_migrations WHERE id = $1',
        [file],
      );

      if (existing.rowCount === 1) {
        if (existing.rows[0].checksum_sha256 !== checksum) {
          throw new Error(
            `[APP MIGRATIONS] Checksum mismatch for already-applied migration ${file}. ` +
              'Applied migration files are immutable; create a new forward migration instead.',
          );
        }
        skipped.push(file);
        continue;
      }

      console.log(`[APP MIGRATIONS] Applying ${file} (${checksum.slice(0, 12)}...)`);
      await client.query(sql);
      await client.query(
        'INSERT INTO app_schema_migrations (id, checksum_sha256) VALUES ($1, $2)',
        [file, checksum],
      );
      applied.push(file);
    }

    await client.query('COMMIT');
    console.log(
      JSON.stringify(
        {
          ok: true,
          migrationDirectory: 'migrations/app',
          applied,
          skipped,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[APP MIGRATIONS] Failed:', error);
  process.exit(1);
});
