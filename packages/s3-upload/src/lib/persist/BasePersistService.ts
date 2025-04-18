import { FileMetadata, FileStatus } from '../models';
import { UploadMetaData } from '@giglabo/upload-shared';

export type UploadFileEntity = {
  fileId: string;
  isMultipart: boolean;
  status: FileStatus;
  objectKey: string;
  s3MultipartUploadId?: string | undefined;
  checkSum: string;
  checkSumAlgorithm: string;
  size: number;
};
export type UploadValues = {
  uploadId: string;

  files: UploadFileEntity[];
};
export type GetObjectKeyFunction = (uploadId: string, fileId: string, fileName: string, hash: string) => Promise<string>;

export abstract class BasePersist {
  async findNotCompletedUpload(_hash: string): Promise<UploadValues | undefined> {
    throw 'not implemented';
  }

  async createNewUpload(
    _hash: string,
    _files: FileMetadata[],
    _metadata: UploadMetaData,
    _createObjectFunc: GetObjectKeyFunction,
  ): Promise<UploadValues | undefined> {
    throw 'not implemented';
  }

  async updateUploadFiles(_savedFiles: UploadFileEntity[]) {
    throw 'not implemented';
  }

  async completeUpload(_uploadId: string) {
    throw 'not implemented';
  }

  async retrieveUploadFile(_uploadId: string, _fileId: string): Promise<UploadFileEntity | undefined | null> {
    throw 'not implemented';
  }

  async completeUploadFile(_uploadId: string, _fileId: string): Promise<UploadFileEntity | undefined | null> {
    throw 'not implemented';
  }
}
