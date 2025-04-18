import { FileMetaData, Hash, HashType, InputFile, UploadMetaData } from '@giglabo/shared';
import { v4 as uuid } from 'uuid';
import { LoggerRequest } from '../store/features/logger';
import { UploadItem } from '../store/features/uploadItem';
import { BackoffParams } from './types';
import { backoffRetryMetadata } from './shared';
import { hexToBase64 } from '../store/shared';
export interface BaseUploadChunk {
  index: number;
  start: number;
  end: number;
}

export type PreCalcOutputItem = { chunks: BaseUploadChunk[] } & {
  relationId: string;
};
export type UrlInputParams = {
  chunkNumber: number;
  filePkId: string | undefined;
  uploadPkId: string | undefined;
  hashType: HashType;
  hash: string;
};

export interface ChunksResponse {
  files: PreCalcOutputItem[];
}

export type CreateUploadChunk = BaseUploadChunk & { status: string };

export type CreateUploadOutputItem = { chunks: CreateUploadChunk[] } & {
  relationId: string;
  status: string;
  fileId: string;
};

export interface CreateUploadResponse {
  uploadId: string;
  files: CreateUploadOutputItem[];
}

export interface CreateUrlResponse {
  presignedUrl: string;
  uploadId: string;
  fileId: string;
  index: number;
}

export interface CompleteFileResponse {
  _?: string;
}
export interface LoggingResponse {
  _?: string;
}

export interface CompleteResponse {
  _?: string;
}

const SUCCESS_CODES = [200, 201];

export class MetaUploadService {
  get completeUploadUrl() {
    return `/api/upload/{{ uploadId }}/complete`;
  }

  get completeUploadFileUrl() {
    return `/api/upload/{{ uploadId }}/files/{{ fileId }}/complete`;
  }
  get createUploadUrlPreSignedUrl() {
    return `/api/upload/{{ uploadId }}/files/{{ fileId }}/chunks/{{ chunkIndex }}/pre-signed-url`;
  }

  get createUploadUrl() {
    return `/api/upload`;
  }

  get preCalculateChunksUrl() {
    return `/api/upload/chunks`;
  }

  createInternalId(_value: InputFile, _index: number) {
    return uuid();
  }

  async chunks(files: FileMetaData[], backoff: BackoffParams): Promise<ChunksResponse> {
    const url = this.metaPreCalculateUrlPath();

    const payload = {
      files: files.map((x) => ({
        relationId: x.internalId,
        size: x.file.size,
      })),
    };

    const headers = await this.enrichHeaders({
      'Content-Type': 'application/json',
    });
    const fetchFn = () =>
      fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

    const { maxRetries, baseDelay } = backoff;
    const response = await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
    const data: ChunksResponse = await response.json();
    return data;
  }

  async enrichHeaders(headers: HeadersInit): Promise<HeadersInit> {
    return headers;
  }

  async log(_loggerRequest: LoggerRequest) {
    return;
  }

  async createUpload(
    internalUploadId: string,
    items: UploadItem[],
    metaData: UploadMetaData,
    force: boolean,
    backoff: BackoffParams,
  ): Promise<CreateUploadResponse> {
    const usp = new URLSearchParams();
    usp.set('force', force + '');
    const url = this.metaCreateUploadUrlPath() + '?' + usp.toString();

    const payload = {
      relationId: internalUploadId,
      metadata: {
        ...metaData,
      },
      files: items.map((x) => {
        return {
          relationId: x.internalId,
          checksum: x.hash,
          checksumAlgorithm: x.hashType,
          name: x.file.name,
          size: x.file.size,
        };
      }),
    };

    const headers = await this.enrichHeaders({
      'Content-Type': 'application/json',
    });
    const fetchFn = () =>
      fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

    const { maxRetries, baseDelay } = backoff;
    const response = await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
    const data: CreateUploadResponse = await response.json();
    return data;
  }

  async commit(pkId: string, backoff: BackoffParams) {
    const url = this.metaCompleteUploadUrlPath({
      uploadId: pkId,
    });

    const headers = await this.enrichHeaders({
      'Content-Type': 'application/json',
    });
    const fetchFn = () =>
      fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

    const { maxRetries, baseDelay } = backoff;
    const response = await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
    if (response.status === 200) {
      const data: CreateUploadResponse = await response.json();
      return data;
    } else if (SUCCESS_CODES.includes(response.status)) {
      return {};
    }

    return {};
  }

  async itemUploaded(uploadEntityPkId: string, uploadItemPkId: string, backoff: BackoffParams) {
    const url = this.metaCompleteUploadFileUrlPath({
      uploadId: uploadEntityPkId,
      fileId: uploadItemPkId,
    });
    const headers = await this.enrichHeaders({
      'Content-Type': 'application/json',
    });
    const fetchFn = () =>
      fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

    const { maxRetries, baseDelay } = backoff;
    const response = await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
    if (response.status === 200) {
      const data: CompleteFileResponse = await response.json();
      return data;
    } else if (SUCCESS_CODES.includes(response.status)) {
      return {};
    }

    return {};
  }

  async retrieveUploadUrl(params: UrlInputParams, backoff: BackoffParams): Promise<CreateUrlResponse> {
    const url = this.metaCreateUploadUrlUrlPath({
      uploadId: params.uploadPkId,
      fileId: params.filePkId,
      chunkIndex: params.chunkNumber,
    });
    const headers = await this.enrichHeaders(await this.createHeadersPreSignedUrl(params, { 'Content-Type': 'application/json' }));
    const fetchFn = () =>
      fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

    const { maxRetries, baseDelay } = backoff;
    const response = await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
    const data: CreateUrlResponse = await response.json();
    return data;
  }

  metaPreCalculateUrlPath(params?: Record<string, any>) {
    const res = this.preCalculateChunksUrl;
    if (params) {
      return this.replaceWithParams(res, params);
    }
    return res;
  }

  metaCreateUploadUrlPath(params?: Record<string, any>) {
    const res = this.createUploadUrl;
    if (params) {
      return this.replaceWithParams(res, params);
    }
    return res;
  }

  metaCreateUploadUrlUrlPath(params?: Record<string, any>) {
    const res = this.createUploadUrlPreSignedUrl;
    if (params) {
      return this.replaceWithParams(res, params);
    }
    return res;
  }

  metaCompleteUploadFileUrlPath(params?: Record<string, any>) {
    const res = this.completeUploadFileUrl;
    if (params) {
      return this.replaceWithParams(res, params);
    }
    return res;
  }

  metaCompleteUploadUrlPath(params?: Record<string, any>) {
    const res = this.completeUploadUrl;
    if (params) {
      return this.replaceWithParams(res, params);
    }
    return res;
  }

  replaceWithParams(str: string, replacements: Record<string, any>) {
    return str.replace(/\{\{(.*?)\}\}/g, function (match) {
      const key = match.replace(/\{\{/, '').replace(/\}\}/, '').trim();
      const replacementVar = typeof replacements[key];
      return replacementVar !== 'undefined' ? replacements[key] : match;
    });
  }

  async createHeadersPreSignedUrl(params: UrlInputParams, headers: HeadersInit): Promise<HeadersInit> {
    let headersResult: HeadersInit = { ...headers };
    if (params.hashType === Hash.MD5) {
      const md5Base64 = hexToBase64(params.hash);
      headersResult = { ...headersResult, 'Content-MD5': md5Base64 };
    }
    return Promise.resolve(headersResult);
  }
}
