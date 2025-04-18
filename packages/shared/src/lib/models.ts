export enum Hash {
  SHA1 = 'sha-1',
  SHA256 = 'sha-256',
  MD5 = 'md5',
  CRC32 = 'crc32',
  CRC32C = 'crc32c',
}

type HashTypeInternal = Hash | 'custom';

export interface FileMetaData {
  file: File;
  internalId: string;
}
export interface BaseChunk {
  chunkNumber: number;
  start: number;
  end: number;
}

export type HashType = HashTypeInternal;

export type MetaRetrieveWorker = () => Worker;
