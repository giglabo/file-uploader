import {
  HashCalcProgress,
  HashCalculator,
  InputFileHashMetaData,
  MetaRetrieveWorker,
  OutputFileHashMetaData,
} from '@giglabo/upload-shared';
import { v4 as uuid } from 'uuid';

export class NoHashCalcService extends HashCalculator {
  constructor() {
    super();
  }

  override cleanUp(): void {
    // TODO
  }

  override calculateHashes(
    _hashAlgo: string,
    _chunkHashAlgo: string,
    files: InputFileHashMetaData[],
    _totalNumberOfWorkers: number,
    _readerChunkSize: number,
    _retrieve: MetaRetrieveWorker,
    _cb?: HashCalcProgress,
  ): Promise<OutputFileHashMetaData[]>[] {
    return [
      Promise.resolve(
        files.map((x) => {
          return {
            hash: uuid(),
            internalId: x.internalId,
            type: 'custom',
            chunks: x.chunks.map((y) => {
              return { ...y, hash: uuid() };
            }),
          };
        }),
      ),
    ];
  }
}
