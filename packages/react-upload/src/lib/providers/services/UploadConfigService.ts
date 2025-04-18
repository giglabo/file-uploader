import { HashType, LoggerType, MetaRetrieveWorker } from '@giglabo/shared';

export class UploadConfigService {
  get metaRetrieveWorker(): MetaRetrieveWorker {
    return (): Worker => {
      throw 'error while uploading worker retrieve worker';
    };
  }

  hashingAlgo(): HashType {
    return 'custom';
  }

  chunkHashingAlgo(): HashType {
    return 'custom';
  }

  readerChunkSize() {
    return 4 * 1024 * 1024;
  }

  totalNumberOfWorkers() {
    return Math.max(this.availableThreads() || 0, 1);
  }

  uploadApiConcurrent() {
    return 5;
  }

  uploadApiRetry() {
    return 0;
  }
  uploadApiRetryBackoffDelay() {
    return 0;
  }

  uploadApiTimeout() {
    return 0;
  }
  metaDataApiRetry() {
    return 0;
  }

  metaDataApiRetryBackoffDelay() {
    return 0;
  }

  logSeverity() {
    return LoggerType.debug.valueOf();
  }

  logEnabled() {
    return LoggerType.off.valueOf() !== this.logSeverity();
  }

  consoleLogEnabled() {
    return true;
  }

  private availableThreads() {
    return (window.navigator?.hardwareConcurrency || 1) - 1;
  }
}
