import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import { CONFIG, type Config } from './config';

/** Every statement goes through here with separate parameters, never string-built SQL. */
@Injectable()
export class Database implements OnModuleDestroy {
  readonly pool: Pool;
  constructor(@Inject(CONFIG) cfg: Config) {
    this.pool = new Pool({
      connectionString: cfg.databaseUrl,
      ssl: cfg.databaseSsl ? { rejectUnauthorized: true } : false,
      max: 10,
      statement_timeout: 5000,
      idle_in_transaction_session_timeout: 10000,
    });
  }
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
  onModuleDestroy() {
    return this.pool.end();
  }
}
