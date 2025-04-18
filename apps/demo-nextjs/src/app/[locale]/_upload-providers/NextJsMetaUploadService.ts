import { MetaUploadService } from '@giglabo/react-upload';
import { urlJoin } from '@giglabo/shared';
import { Env } from '@/libs/Env';

export class NextJsMetaUploadService extends MetaUploadService {
  constructor() {
    super();
  }

  get preCalculateChunksUrl() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/chunks/`);
  }

  get createUploadUrl(): string {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/`);
  }

  get createUploadUrlPreSignedUrl() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/files/{{ fileId }}/chunks/{{ chunkIndex }}/pre-signed-url/`);
  }

  get completeUploadFileUrl() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/files/{{ fileId }}/complete/`);
  }

  get completeUploadUrl() {
    return urlJoin(Env.NEXT_PUBLIC_BASE_URL, `/api/upload/{{ uploadId }}/complete/`);
  }
}
