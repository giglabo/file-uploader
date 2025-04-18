import { UploadConfigService } from '@giglabo/react-upload';
import { Hash, HashType, MetaRetrieveWorker } from '@giglabo/upload-shared';

export class NextJsUploadConfigService extends UploadConfigService {
  private _hashingAlgo: HashType;
  private _chunkHashingAlgo: HashType;

  constructor(options?: { hashingAlgo?: HashType; chunkHashingAlgo?: HashType }) {
    super();
    this._hashingAlgo = options?.hashingAlgo || Hash.MD5;
    this._chunkHashingAlgo = options?.chunkHashingAlgo || Hash.MD5;
  }
  logEnabled() {
    return false;
  }
  get metaRetrieveWorker(): MetaRetrieveWorker {
    return (): Worker => {
      return new Worker(new URL('../../../workers/hashing-worker.worker.ts', import.meta.url), {
        type: 'module',
      });
    };
  }

  hashingAlgo(): HashType {
    return this._hashingAlgo;
  }

  chunkHashingAlgo(): HashType {
    return this._chunkHashingAlgo;
  }
}
