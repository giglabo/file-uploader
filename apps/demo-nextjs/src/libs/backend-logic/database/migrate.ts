import { Client, ClientConfig } from 'pg';
import { migrate } from 'postgres-migrations';
import { logger } from '@/libs/Logger';
import { Env } from '@/libs/Env';

/**
 * Runs SQL migrations
 */
export async function runMigrations(): Promise<void> {
  logger.info('SQL migrations');
  let ssl: ClientConfig['ssl'] | undefined = undefined;

  const databaseSSLRootCert = '';
  if (databaseSSLRootCert) {
    ssl = { ca: databaseSSLRootCert };
  }
  // logger.info(Env.DATABASE_URL, Env.DATABASE_MIGRATION_FOLDER);
  await connectAndMigrate(Env.DATABASE_URL, Env.DATABASE_MIGRATION_FOLDER, ssl);
  logger.info('finished migrations');
}

async function connectAndMigrate(databaseUrl: string | undefined, migrationsDirectory: string, ssl?: ClientConfig['ssl']) {
  const dbConfig: ClientConfig = {
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10_000,
    options: '-c search_path=public',
    ssl,
  };

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await migrate({ client }, migrationsDirectory, {
      logger: (msg: string) => {
        logger.info(msg);
      },
    });
  } finally {
    await client.end();
  }
}
