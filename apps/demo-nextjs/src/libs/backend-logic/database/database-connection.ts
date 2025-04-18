import { DataSource, EntitySchema } from 'typeorm';
import { createPostgresDataSource } from './postgres-connection';

import { StatusEntity, UploadEntity, UploadFileEntity, UploadArchiveEntity, UploadArchiveFileEntity } from './entities';

function getEntities(): EntitySchema<unknown>[] {
  return [StatusEntity, UploadEntity, UploadFileEntity, UploadArchiveEntity, UploadArchiveFileEntity];
}

const getSynchronize = (): boolean => {
  return false;
};

export const commonProperties = {
  subscribers: [],
  entities: getEntities(),
  synchronize: getSynchronize(),
};

export const dbInit = async () => {
  const db = createPostgresDataSource(true);
  await db.initialize();
};

export const retrieveDatabaseConnection = () => {
  return global.selfConfig.databaseConnectionValue;
};

const createDb = async () => {
  if (!global.selfConfig.databaseConnectionValue) {
    global.selfConfig.databaseConnectionValue = createPostgresDataSource(false);
    await global.selfConfig.databaseConnectionValue.initialize();
  }
  return global.selfConfig.databaseConnectionValue;
};

export const retrieveDb = async () => {
  return createDb();
};
