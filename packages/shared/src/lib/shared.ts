import { BaseChunk, FileMetaData, Hash, HashType, MetaRetrieveWorker } from './models';

export type UploadMetaData = Record<string, any> | Record<string, any>[];
export type UploadFileMetaData = Record<string, any> | Record<string, any>[];

export interface UploadSystemInject {
  metaRetrieveWorker: MetaRetrieveWorker;
}
export interface UploadSystemConfig {
  logSeverity?: number;
  consoleLogEnabled?: boolean;
  hasPrivateUrls?: boolean;
  uploadApi?: {
    concurrent: number;
    retry: number;
    backoffDelay: number;
    timeout: number;
  };
  metaDataApi: {
    retry?: number;
    backoffDelay?: number;
    baseUrl?: string;
    basePrivateUrl?: string;
    paths?: {
      preCalculateChunksPath?: string;
      createUploadPath?: string;
      createUploadUrlPath?: string;
      completeUploadFileUrlPath?: string;
      completeUploadUrlPath?: string;
    };
  };
  hashes?: {
    fileAlgo?: HashType;
    chunkAlgo?: HashType;
    concurrent?: number;
    readerChunkSize?: number;
  };
}

export const loggerStrings: Record<number, string> = {
  100: 'error',
  90: 'warn',
  80: 'info',
  70: 'debug',
  50: 'verbose',
};
export enum LoggerType {
  error = 100,
  warn = 90,
  info = 80,
  debug = 70,
  verbose = 50,
  off = 1000,
}

export interface InputFile {
  file: File;
  metaData: Record<string, any> | Record<string, any>[];
}

export interface OutputFileHashMetaData {
  hash: string;
  internalId: string;
  type: HashType;
  chunks: HashOutputChunk[];
  calculationTime?: number;
}

export interface OutputFileHashProgressData {
  internalId: string;
  size: number;
  offset: number;
}

export type OutputFileHashMap = {
  hash: OutputFileHashMetaData;
  progress: OutputFileHashProgressData;
};

export declare type OutputFileHashMapKey = keyof OutputFileHashMap;

export type OutputFileHash<T extends OutputFileHashMapKey> = {
  type: T;
  value: OutputFileHashMap[T];
};

export type HashCalcProgress = (data: OutputFileHashProgressData) => Promise<void>;

export interface HashOutputChunk extends BaseChunk {
  hash: string;
}
export interface InputFileHashMetaData extends FileMetaData {
  chunks: BaseChunk[];
}

export interface HashMessageWrapper {
  inputFileHashMetaData: InputFileHashMetaData;
  fileHashAlgorithm: Hash;
  chunkHashAlgorithm: Hash;
  chunkSize: number;
}

export enum UploadEntityStatusEnum {
  REGISTERED = 'REGISTERED',
  FILES_ADDED = 'FILES_ADDED',
  UPLOAD_REQUEST = 'UPLOAD_REQUEST',
  ENRICHED = 'ENRICHED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export interface BaseError {
  errorCode?: string;
  errorMessage?: string;
  errorData?: any;
}
export interface BaseUploadEntity extends BaseError {
  id: string;
  pkId?: string;
  status: UploadEntityStatusEnum;
}

export enum UploadItemStatusEnum {
  REGISTERED = 'REGISTERED',
  INTEGRITY_CALCULATION = 'INTEGRITY_CALCULATION',
  ADDED = 'ADDED',
  TERMINATED = 'TERMINATED',
  MISSED = 'MISSED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  COMPLETED_CHUNKS = 'COMPLETED_CHUNKS',
  FAILED = 'FAILED',
  FAILED_INCONSISTENCY = 'FAILED_INCONSISTENCY',
}
export interface BaseUploadItem extends BaseError {
  pkId?: string;
  status: UploadItemStatusEnum;
  file: File;
  size: number;
  name: string;
  uploaded: number;
  integrityProcessed: number;
}

export enum UploadPieceItemStatusEnum {
  ADDED = 'ADDED',
  MISSED = 'MISSED',
  TERMINATED = 'TERMINATED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class ErrorCodes {
  static readonly INTERNAL_APP_ERROR = 'INTERNAL_APP_ERROR';
  static readonly META_DATA_API_HTTP_ERROR = 'META_DATA_API_HTTP_ERROR';
  static readonly UPLOAD_API_HTTP_ERROR = 'UPLOAD_API_HTTP_ERROR';
}

export abstract class HashCalculator {
  abstract calculateHashes(
    hashAlgo: string,
    chunkHashAlgo: string,
    files: InputFileHashMetaData[],
    totalNumberOfWorkers: number,
    readerChunkSize: number,
    retrieveWorker: MetaRetrieveWorker,
    cb?: HashCalcProgress,
  ): Promise<OutputFileHashMetaData[]>[];

  abstract cleanUp(): void;
}

export abstract class BaseHashCalculatorFactory {
  abstract create(): HashCalculator;
}

export abstract class UploadSystemConfigService {
  config(): UploadSystemConfig {
    return {
      metaDataApi: {},
    };
  }
}
