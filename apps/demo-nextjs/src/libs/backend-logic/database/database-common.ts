import { EntitySchemaColumnOptions, MigrationInterface, MixedList } from 'typeorm';
import { Env } from '@/libs/Env';

const dbType = Env.DB_TYPE;

export const JSON_COLUMN_TYPE = dbType === 'SQLITE3' ? 'simple-json' : 'json';
export const JSONB_COLUMN_TYPE = dbType === 'SQLITE3' ? 'simple-json' : 'jsonb';
export const BLOB_COLUMN_TYPE = dbType === 'SQLITE3' ? 'blob' : 'bytea';
export const ARRAY_COLUMN_TYPE = dbType === 'SQLITE3' ? 'simple-array' : String;
export const TIMESTAMP_COLUMN_TYPE = dbType === 'SQLITE3' ? 'datetime' : 'timestamp with time zone';

export const COLLATION = dbType === 'SQLITE3' ? undefined : 'en_natural';

export function isPostgres(): boolean {
  return dbType === 'POSTGRES';
}

export const IdSchema = {
  type: 'uuid',
} as EntitySchemaColumnOptions;

export const idSchema = {
  type: 'string',
} as const;

export const baseIDSchemaPart = (name: string, columnName: string | null = null, primary = true) => {
  return {
    [name]: {
      ...IdSchema,
      primary,
      name: columnName || name,
    } as EntitySchemaColumnOptions,
  };
};

export const BaseDatesColumnSchemaPart = {
  created: {
    name: 'ts',
    type: TIMESTAMP_COLUMN_TYPE,
    createDate: true,
  } as EntitySchemaColumnOptions,
  updated: {
    name: 'uts',
    type: TIMESTAMP_COLUMN_TYPE,
    updateDate: true,
  } as EntitySchemaColumnOptions,
};

export const BaseCreateDateColumnSchemaPart = {
  created: {
    name: 'ts',
    type: TIMESTAMP_COLUMN_TYPE,
    createDate: true,
  } as EntitySchemaColumnOptions,
};

export const BaseColumnStatusPart = {
  statusUid: {
    name: 'status_uid',
    ...IdSchema,
    nullable: false,
  } as EntitySchemaColumnOptions,
};

export type MigrationConfig = {
  migrationsRun?: boolean;
  migrationsTransactionMode?: 'all' | 'none' | 'each';
  migrations?: (new () => MigrationInterface)[];
  migrationsTableName?: string;
};
