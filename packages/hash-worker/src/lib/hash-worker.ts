import { Hash, HashMessageWrapper, HashOutputChunk, InputFileHashMetaData, OutputFileHash, OutputFileHashMetaData } from '@giglabo/upload-shared';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import { createCRC32, createMD5, createSHA1, createSHA256 } from 'hash-wasm';
import * as df from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export async function hashWorker(e: MessageEvent<HashMessageWrapper>) {
  async function getIHasher(hashType: Hash) {
    return await (async () => {
      switch (hashType) {
        case Hash.SHA1:
          return await createSHA1();
        case Hash.SHA256:
          return await createSHA256();
        case Hash.MD5:
          return await createMD5();
        case Hash.CRC32:
          return await createCRC32();
        case Hash.CRC32C:
          return await createCRC32(0x82f63b78);
      }
    })();
  }

  async function calculateHashFor(
    fileHashAlgorithm: Hash,
    chunkHashAlgorithm: Hash,
    readChunkSize: number,
    inputFileHashMetaData: InputFileHashMetaData,
  ): Promise<OutputFileHashMetaData> {
    const fileHasher: IHasher | undefined = await getIHasher(fileHashAlgorithm);

    const chunkHasher: IHasher | undefined = await getIHasher(chunkHashAlgorithm);

    fileHasher?.init();

    const providedChunks: HashOutputChunk[] = [];
    for (const chunk of inputFileHashMetaData.chunks) {
      chunkHasher?.init();
      let offset = chunk.start;
      while (offset < chunk.end) {
        const start = offset;
        const end = Math.min(offset + readChunkSize, chunk.end);
        const subChunk = inputFileHashMetaData.file.slice(start, end);
        const buffer = await readChunk(subChunk);
        chunkHasher?.update(buffer);
        fileHasher?.update(buffer);
        offset += readChunkSize;
      }
      providedChunks.push({
        ...chunk,
        hash: chunkHasher?.digest() || '',
      });

      const evtData: OutputFileHash<'progress'> = {
        type: 'progress',
        value: { internalId: inputFileHashMetaData.internalId, offset, size: inputFileHashMetaData.file.size },
      };
      postMessage(evtData);
    }
    const fullHash = fileHasher?.digest() || uuidv4();
    return {
      hash: fullHash,
      internalId: inputFileHashMetaData.internalId,
      chunks: providedChunks,
      type: fileHashAlgorithm,
    };
  }

  async function readChunk(chunk: Blob): Promise<Uint8Array> {
    return new Promise((resolve: any, reject: any) => {
      const fileReader = new FileReader();
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(e.target.result));
        } else {
          reject(`Cannot read ${chunk}`);
        }
      };
      fileReader.readAsArrayBuffer(chunk);
    });
  }

  if (e.data) {
    const startTime = new Date();
    const hashFile = await calculateHashFor(
      e.data.fileHashAlgorithm,
      e.data.chunkHashAlgorithm,
      e.data.chunkSize,
      e.data.inputFileHashMetaData,
    );
    const endTime = new Date();
    const calculationTime = df.differenceInMilliseconds(endTime, -startTime);
    const evtData: OutputFileHash<'hash'> = { type: 'hash', value: { ...hashFile, calculationTime } };
    postMessage(evtData);
  }
}
