import { EntitySchema } from 'typeorm';
import { BaseDatesColumnSchemaPart, BaseColumnStatusPart, baseIDSchemaPart, JSONB_COLUMN_TYPE } from '../database-common';
import { Upload, Status, UploadArchivePK } from '../dto';

export type UploadArchiveSchema = {
  status: Status;
} & Upload &
  UploadArchivePK;

export const UploadArchiveEntity = new EntitySchema<UploadArchiveSchema>({
  name: `upload_archives`,
  columns: {
    ...baseIDSchemaPart('uploadArchiveUid', 'upload_archive_uid'),
    ...baseIDSchemaPart('rootUserUid', 'root_user_uid', false),
    ...BaseDatesColumnSchemaPart,
    ...BaseColumnStatusPart,
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
