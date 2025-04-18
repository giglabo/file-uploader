import { Chunk } from '../models';

export interface ChunkCalculationService {
  calculateChunks(fileSize: number): Chunk[];
}
