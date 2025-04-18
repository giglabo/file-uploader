export type FileItem = {
  id: string;
  file: File;
  checksum?: string;
  checksumAlgorithm?: string;
};

export type InputFile = {
  file: File;
  metaData: Record<string, any> | Record<string, any>[];
};

export type StatusCode = 'ACTIVE' | 'IN_PROCESS' | 'PROCESSED' | 'DELETED' | 'EXPIRED';
export type UploadedFile = {
  fileId: string;
  fileName: string;
  fileSize: number;
  checksum: number;
  checksumAlgorithm: string;
  created: string;
  updated: string;
  status: StatusCode;
  downloadUrl: string;
};

export type ChecksumAlgorithm = 'md5' | 'sha1' | 'sha256' | 'crc32' | 'crc32c' | '';

export type UploadedFilesObject = {
  uploadUid: string;
  created: string;
  updated: string;
  status: StatusCode;
  files: UploadedFile[];
};
