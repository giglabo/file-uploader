import { BaseUploadConfiguration } from '@giglabo/s3-upload';
import { Env } from '@/libs/Env';

export class MainStorageUploadConfiguration extends BaseUploadConfiguration {
  override getBucket(): Promise<string> {
    return Promise.resolve(Env.s3Bucket);
  }
  override getObjectKey(uploadId: string, fileId: string, _fileName: string, _hash: string): Promise<string> {
    return Promise.resolve(`custom-path/${uploadId}/${fileId}`);
  }
}
