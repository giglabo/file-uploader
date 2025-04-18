import {
  HashCalcProgress,
  HashCalculator,
  InputFileHashMetaData,
  MetaRetrieveWorker,
  OutputFileHash,
  OutputFileHashMap,
  OutputFileHashMapKey,
  OutputFileHashMetaData,
} from '@giglabo/shared';
import { v4 as uuid } from 'uuid';

class Bin {
  readonly binId: string;
  readonly capacity: number;
  readonly inputFileHashMetaData: InputFileHashMetaData[];
  private availableSpace: number;
  private currentSize: number;

  constructor(capacity: number, files: InputFileHashMetaData[]) {
    this.currentSize = 0;
    this.inputFileHashMetaData = files;
    this.capacity = capacity;
    this.availableSpace = capacity;
    this.binId = uuid();
  }

  getSize(): number {
    return this.currentSize;
  }

  addItem(file: InputFileHashMetaData): void {
    this.inputFileHashMetaData.push(file);
    this.currentSize += file.file.size;
    this.availableSpace -= file.file.size;
  }

  getAvailableSpace(): number {
    return this.availableSpace;
  }

  getFiles(): File[] {
    return this.inputFileHashMetaData.map((inputFileHashMetaData) => inputFileHashMetaData.file);
  }
}
class BinPackaging {
  private readonly bins: Bin[];

  constructor(workerNumber: number, files: InputFileHashMetaData[]) {
    const biggest = files.reduce((prev, file) => (prev > file.file.size ? prev : file.file.size), 0);
    if (workerNumber <= 0) {
      this.bins = [new Bin(biggest, files)];
    }
    const amountOfBins = files.length < workerNumber ? files.length : workerNumber;
    this.bins = Array.from({ length: amountOfBins }, () => new Bin(biggest, []));
    this.bins = this.packFiles(files);
  }

  getBins(): Bin[] {
    return this.bins;
  }

  private packFiles(files: InputFileHashMetaData[]): Bin[] {
    const sortedFiles = files.sort((a, b) => b.file.size - a.file.size);
    for (const file of sortedFiles) {
      const bin = this.bins.find((b) => b.getAvailableSpace() >= file.file.size);
      if (bin) {
        bin.addItem(file);
      } else {
        const bestBin = this.bins.reduce(
          (best, bin) => (bin.getAvailableSpace() > (best?.getAvailableSpace() || 0) ? bin : best),
          this.bins[0],
        );
        if (bestBin) {
          bestBin.addItem(file);
        }
      }
    }
    return this.bins;
  }
}

class InternalWorker {
  private readonly worker: Worker;

  constructor(
    private hashAlgo: string,
    private chunkHashAlgo: string,
    private bin: Bin,
    private readerChunkSize: number,
    private retrieveWorker: MetaRetrieveWorker,
    private cb?: HashCalcProgress,
  ) {
    this.worker = this.retrieveWorker();
  }

  async retrieve(): Promise<OutputFileHashMetaData[]> {
    const outputFileHashMetaData: OutputFileHashMetaData[] = [];
    for (const fileMeta of this.bin.inputFileHashMetaData) {
      outputFileHashMetaData.push(await this.dispatchWork(fileMeta));
    }
    return outputFileHashMetaData;
  }

  terminate() {
    this.worker.terminate();
  }

  private dispatchWork(file: InputFileHashMetaData): Promise<OutputFileHashMetaData> {
    return new Promise<OutputFileHashMetaData>((resolve, reject) => {
      this.worker.onmessage = (event: MessageEvent<OutputFileHash<'hash'> | OutputFileHash<'progress'>>) => {
        const result = event.data;
        if (result.type === 'hash') {
          resolve(result.value);
        } else if (result.type === 'progress') {
          // callback
          if (this.cb) {
            const value = result.value;
            this.cb(value).then();
          }
        }
      };

      this.worker.onerror = (error) => {
        reject(error);
      };
      const eventData = {
        inputFileHashMetaData: file,
        fileHashAlgorithm: this.hashAlgo,
        chunkHashAlgorithm: this.chunkHashAlgo,
        chunkSize: this.readerChunkSize,
      };
      this.worker.postMessage(eventData);
    });
  }
}

export class HashingService extends HashCalculator {
  private readonly workers: InternalWorker[] = [];

  constructor() {
    super();
  }

  cleanUp(): void {
    for (const worker of this.workers) {
      try {
        worker.terminate();
      } catch (e) {
        // TODO
      }
    }
  }

  calculateHashes(
    hashAlgo: string,
    chunkHashAlgo: string,
    files: InputFileHashMetaData[],
    totalNumberOfWorkers: number,
    readerChunkSize: number,
    retrieveWorker: MetaRetrieveWorker,
    cb?: HashCalcProgress,
  ): Promise<OutputFileHashMetaData[]>[] {
    const binPack = new BinPackaging(totalNumberOfWorkers, files);
    return binPack
      .getBins()
      .filter((bin) => bin.getFiles().length > 0)
      .map((bin) => {
        const worker = new InternalWorker(hashAlgo, chunkHashAlgo, bin, readerChunkSize, retrieveWorker, cb);
        this.workers.push(worker);
        return worker.retrieve();
      });
  }
}
