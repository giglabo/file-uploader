import { EntitySchema } from 'typeorm';
import { BaseDatesColumnSchemaPart, BaseColumnStatusPart, baseIDSchemaPart, JSONB_COLUMN_TYPE } from '../database-common';
import { Upload, Status, UploadPK } from '../dto';

export type UploadSchema = {
  status: Status;
} & Upload &
  UploadPK;

export const UploadEntity = new EntitySchema<UploadSchema>({
  name: `uploads`,
  columns: {
    ...baseIDSchemaPart('uploadUid', 'upload_uid'),
    ...baseIDSchemaPart('rootUserUid', 'root_user_uid', false),
    ...BaseDatesColumnSchemaPart,
    ...BaseColumnStatusPart,
    hash: {
      name: 'hash',
      type: String,
      nullable: false,
    },
    metaData: {
      name: 'meta_data',
      type: JSONB_COLUMN_TYPE,
      nullable: true,
    },
  },
  relations: {
    status: {
      type: 'many-to-one',
      target: 'statuses',
      joinColumn: {
        name: 'status_uid',
      },
    },
  },
});
