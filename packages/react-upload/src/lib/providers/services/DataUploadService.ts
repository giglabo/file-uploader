import { hexToBase64 } from '../store/shared';
import { BackoffParams } from './types';
import { Hash, HashType } from '@giglabo/shared';
import { backoffRetryMetadata } from './shared';

export type UploadResponse = { _?: string };

export interface UploadParams {
  file: File;
  hashType: HashType;
  chunkNumber: number;
  url: string;
  hash: string;
}

export class DataUploadService {
  async upload(
    params: UploadParams,
    backoffUpload: BackoffParams,
    uploadTimeout: number,
    _: (res: { loaded: number; total: number }) => void,
  ) {
    const headers = await this.enrichHeaders(params, {
      'Content-Type': 'application/octet-stream',
    });

    const { file, chunkNumber, url, hash, hashType } = params;

    const controller = new AbortController();

    const fetchFn = () => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      if (uploadTimeout > 0) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, uploadTimeout);
      }
      try {
        return fetch(url, {
          method: 'PUT',
          headers,
          body: file,
        });
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    const { maxRetries, baseDelay } = backoffUpload;
    return await backoffRetryMetadata<Response>(maxRetries, baseDelay)(fetchFn);
  }

  private async enrichHeaders(params: UploadParams, headers: HeadersInit): Promise<HeadersInit> {
    let headersResult: HeadersInit = { ...headers };

    if (params.hashType === Hash.MD5) {
      const md5Base64 = hexToBase64(params.hash);
      headersResult = { ...headersResult, 'Content-MD5': md5Base64 };
    }
    return Promise.resolve(headersResult);
  }
}
