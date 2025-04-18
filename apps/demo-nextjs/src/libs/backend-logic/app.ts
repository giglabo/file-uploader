import { logger } from '@/libs/Logger';
import { database } from '@/libs/backend-logic';
import { Env } from '@/libs/Env';

function setupTimeZone(): void {
  process.env.TZ = 'UTC';
}
export async function init() {
  logger.info('Application initialization');
  setupTimeZone();
  (global.selfConfig as any) = {};
  try {
    await database.db.dbInit();
    await database.migrate.runMigrations();
  } catch (e) {
    logger.error(e, 'Cannot run migration');
    if (Env.NODE_ENV === 'production' && !process.env['IGNORE_MIGRATION']) {
      throw e;
    }
  }
  await database.db.retrieveDb();

  await database.dbs.initStatuses();
}
