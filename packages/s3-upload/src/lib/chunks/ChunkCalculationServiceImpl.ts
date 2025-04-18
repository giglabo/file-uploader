import { Chunk } from '../models';
import { ChunkCalculationService } from './ChunkCalculationService';

const MAX_CHUNKS = 10000;

export class ChunkCalculationServiceImpl implements ChunkCalculationService {
  static readonly MIN_CHUNK_SIZE = 5 * 1024 * 1024;
  static readonly CHUNK_SIZE = 20 * 1024 * 1024;
  calculateChunks(fileSize: number): Chunk[] {
    if (fileSize <= ChunkCalculationServiceImpl.CHUNK_SIZE) {
      return [{ index: 1, start: 0, end: fileSize, status: '' }];
    } else {
      const numberOfChunks = Math.floor(fileSize / ChunkCalculationServiceImpl.CHUNK_SIZE);
      const remainingBytes = fileSize % ChunkCalculationServiceImpl.CHUNK_SIZE;
      if (numberOfChunks > MAX_CHUNKS || (numberOfChunks == MAX_CHUNKS && remainingBytes > 0)) {
        throw 'File exceeds maximum size of 1TB.';
      }

      const chunks: Chunk[] = [];
      chunks.push({ index: 1, start: 0, end: ChunkCalculationServiceImpl.CHUNK_SIZE, status: '' });
      for (let i = 1; i < numberOfChunks; i++) {
        chunks.push({
          index: i + 1,
          start: ChunkCalculationServiceImpl.CHUNK_SIZE * i,
          end: ChunkCalculationServiceImpl.CHUNK_SIZE * (i + 1),
          status: '',
        });
      }
      if (remainingBytes > 0) {
        chunks.push({
          index: chunks.length + 1,
          start: ChunkCalculationServiceImpl.CHUNK_SIZE * numberOfChunks,
          end: ChunkCalculationServiceImpl.CHUNK_SIZE * numberOfChunks + remainingBytes,
          status: '',
        });
      }
      return chunks;
    }
  }
}
