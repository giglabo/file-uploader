export abstract class BaseUploadConfiguration {
  abstract getBucket(): Promise<string>;
  abstract getObjectKey(uploadId: string, fileId: string, fileName: string, hash: string): Promise<string>;
}
