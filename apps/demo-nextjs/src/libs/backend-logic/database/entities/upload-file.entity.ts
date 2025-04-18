import { EntitySchema } from 'typeorm';
import { BaseDatesColumnSchemaPart, BaseColumnStatusPart, baseIDSchemaPart, JSONB_COLUMN_TYPE } from '../database-common';
import { UploadFile, Status, Upload, UploadFilePK, UploadPK } from '../dto';

export type UploadFileSchema = {
  status: Status;
  upload: Upload;
} & UploadFile &
  UploadPK &
  UploadFilePK;

export const UploadFileEntity = new EntitySchema<UploadFileSchema>({
  name: `upload_files`,
  columns: {
    ...baseIDSchemaPart('uploadFileUid', 'upload_file_uid'),
    ...baseIDSchemaPart('uploadUid', 'upload_uid', false),
    ...baseIDSchemaPart('rootUserUid', 'root_user_uid', false),
    ...BaseDatesColumnSchemaPart,
    ...BaseColumnStatusPart,
    metaData: {
      name: 'meta_data',
      type: JSONB_COLUMN_TYPE,
      nullable: true,
    },
    fileName: {
      name: 'file_name',
      type: String,
      nullable: false,
    },
    fileSize: {
      name: 'file_size',
      type: Number,
      nullable: false,
    },
    s3MultipartUploadKey: {
      name: 's3_multipart_upload_key',
      type: String,
      nullable: false,
    },
    s3ObjectKey: {
      name: 's3_object_key',
      type: String,
      nullable: false,
    },
    downloadUrl: {
      name: 'download_url',
      type: String,
      nullable: true,
    },
    checksum: {
      name: 'checksum',
      type: String,
      nullable: false,
    },
    checksumAlgorithm: {
      name: 'checksum_algorithm',
      type: String,
      nullable: false,
    },
  },
  relations: {
    status: {
      type: 'many-to-one',
      target: 'statuses',
      nullable: false,
      joinColumn: {
        name: 'status_uid',
      },
    },
    upload: {
      type: 'many-to-one',
      target: 'uploads',
      nullable: false,
      joinColumn: {
        name: 'upload_uid',
      },
    },
  },
});
