import { HashType, UploadMetaData } from '@giglabo/shared';

export type Chunk = {
  index: number;
  start: number;
  end: number;
  status: string;
};

export type ChunkedFile = {
  relationId: string;
  chunks: Chunk[];
};

export type FileMetadata = {
  checksum: string;
  checksumAlgorithm: HashType;
  name: string;
  relationId: string;
  size: number;
  metadata?: UploadMetaData;
};

export type UploadRequest = {
  files: FileMetadata[];
  metadata?: UploadMetaData;
  relationId: string;
};

export enum FileStatus {
  COMPLETED = 'completed',
  NOT_COMPLETED = 'not-completed',
}

export class FileStatusHelper {
  static getValue(status: FileStatus): string {
    return status;
  }
}

export type FileUpload = {
  fileId: string;
  relationId: string;
  status: FileStatus;
  chunks: Chunk[];
};

export type UploadResponse = {
  uploadId: string;
  files: FileUpload[];
  relationId: string;
};
