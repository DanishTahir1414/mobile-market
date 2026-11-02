import { Pool } from 'pg';
import { loadConfig } from './config';
import { migrate } from './migrate';

const cfg = loadConfig();
const pool = new Pool({
  connectionString: cfg.databaseUrl,
  ssl: cfg.databaseSsl ? { rejectUnauthorized: true } : false,
});
migrate(pool)
  .then((applied) =>
    console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date'),
  )
  .catch((error: Error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
