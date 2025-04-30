import { UploadConfigService } from '@giglabo/react-upload';
import { Hash, HashType, MetaRetrieveWorker } from '@giglabo/upload-shared';

export class CustomUploadConfigService extends UploadConfigService {
  get metaRetrieveWorker(): MetaRetrieveWorker {
    return (): Worker => {
      return new Worker(new URL('../hashing-worker.worker.ts', import.meta.url), {
        type: 'module',
      });
    };
  }

  hashingAlgo(): HashType {
    return Hash.MD5;
  }

  chunkHashingAlgo(): HashType {
    return Hash.MD5;
  }
}
