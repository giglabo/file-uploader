import { Status } from './dto';
import { retrieveDatabaseConnection } from '@/libs/backend-logic/database/database-connection';
import { StatusEntity } from '@/libs/backend-logic/database/entities';

export const retrieveStatuses = (): Record<string, Status> => {
  return global.selfConfig.statuses;
};

export const initStatuses = async () => {
  const dataBaseConnection = retrieveDatabaseConnection();
  global.selfConfig.statuses = (await dataBaseConnection.getRepository(StatusEntity).find()).reduce(
    (acc, cur) => {
      acc[cur.code] = cur;
      return acc;
    },
    {} as Record<string, Status>,
  );
};
