import { type DataSource } from 'typeorm';
import { type Status } from '@/libs/backend-logic/database/dto';
import { type S3Config, type S3Upload } from '@giglabo/s3-upload';
import { type MainStorageUploadConfiguration } from '@/libs/backend-logic/storage';

declare global {
  /* eslint-disable no-var */
  var selfConfig: {
    databaseConnectionValue: DataSource;
    statuses: Record<string, Status>;
    sS3Upload: S3Upload;
    s3Config: S3Config;
    mainStorageUploadConfiguration: MainStorageUploadConfiguration;
  };
}

declare global {
  namespace NodeJS {
    interface Global {
      selfConfig: {
        databaseConnectionValue: DataSource;
        statuses: Record<string, Status>;
        sS3Upload: S3Upload;
        s3Config: S3Config;
        mainStorageUploadConfiguration: MainStorageUploadConfiguration;
      };
    }
  }
}
