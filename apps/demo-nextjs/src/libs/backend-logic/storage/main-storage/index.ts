import { MainStorageUploadConfiguration } from '@/libs/backend-logic/storage';

export * from './main-s3-config';
export * from './main-s3-upload';
export * from './main-s3-persistent';
export * from './main-storage-upload-configuration';

export const mainStorageUploadConfiguration = () => {
  if (!global.selfConfig.mainStorageUploadConfiguration) {
    global.selfConfig.mainStorageUploadConfiguration = new MainStorageUploadConfiguration();
  }
  return global.selfConfig.mainStorageUploadConfiguration;
};
