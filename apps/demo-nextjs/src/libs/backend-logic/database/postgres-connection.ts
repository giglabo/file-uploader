import { DataSource, MigrationInterface } from 'typeorm';
import { TlsOptions } from 'node:tls';
import { commonProperties } from './database-connection';
import { MigrationConfig } from './database-common';
import { initializeSchema1710133461411 } from './migration/postgres/1710133461411-initialize-schema';
import { logger } from '@/libs/Logger';
import { Env } from '@/libs/Env';
import { DataSourceOptions } from 'typeorm';

const getSslConfig = (): boolean | TlsOptions => {
  const postgresUseSsl = Env.POSTGRES_USE_SSL === 'true';

  const postgresSslCa = '';

  if (postgresUseSsl) {
    return {
      ca: postgresSslCa?.replace(/\\n/g, '\n'),
    };
  }

  return false;
};

const getMigrationInit = (): (new () => MigrationInterface)[] => {
  logger.info('ORM Initial migrations');
  return [initializeSchema1710133461411];
};

const getMigrations = (): (new () => MigrationInterface)[] => {
  logger.info('Custom ORM migrations');
  return [];
};

const getMigrationConfig = (init: boolean): MigrationConfig => {
  const env = Env.NODE_ENV;

  if (env === 'test') {
    return {};
  }

  return {
    migrationsRun: true,
    migrationsTransactionMode: 'each',
    migrations: init ? getMigrationInit() : getMigrations(),
    migrationsTableName: Env.DATABASE_MIGRATION_TABLE,
  };
};

export const createPostgresDataSource = (init: boolean): DataSource => {
  const migrationConfig = getMigrationConfig(init);

  const initValue: DataSourceOptions = {
    type: 'postgres',
    host: Env.POSTGRES_HOST,
    port: Number.parseInt(Env.POSTGRES_PORT, 10),
    username: Env.POSTGRES_USERNAME,
    password: Env.POSTGRES_PASSWORD,
    database: Env.POSTGRES_DATABASE,
    entityPrefix: '',
    ssl: getSslConfig(),
    ...commonProperties,
    synchronize: false,
    ...(migrationConfig as any),
  };

  // logger.info(JSON.stringify(initValue, null, 4));

  return new DataSource(initValue);
};
