import { MetaUploadService } from '@giglabo/react-upload';
import { urlJoin } from '@giglabo/shared';
import { Env } from '@/libs/Env';

export class NextJsMetaUploadService extends MetaUploadService {
  constructor() {
    super();
  }

  get preCalculateChunksPath() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/chunks/`);
  }

  get createUploadPath(): string {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/`);
  }

  get createUploadUrlPath() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/files/{{ fileId }}/chunks/{{ chunkIndex }}/presigned-url/`);
  }

  get completeUploadFileUrlPath() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/files/{{ fileId }}/complete/`);
  }

  get completeUploadUrlPath() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/complete/`);
  }
}
