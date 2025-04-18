import { BaseError, HashType, UploadPieceItemStatusEnum } from '@giglabo/shared';
import { UploadItem } from '../uploadItem';

export interface UploadPieceItem extends BaseError {
  chunkId: string;
  itemId: string;
  internalUploadId: string;
  status: UploadPieceItemStatusEnum;
  start: number;
  end: number;
  chunkNumber: number;
  hash: string;
  hashType: HashType;
  loaded?: number;
  total?: number;
}

export interface UpdateUploadPieceItem {
  chunkId: string;
  update: Partial<UploadPieceItem>;
}

export interface UploadPieceItemInput {
  item: UploadItem;
  piece: UploadPieceItem;
  url: string;
}

export const notAvailableStatusesToStartUpload = [
  UploadPieceItemStatusEnum.TERMINATED,
  UploadPieceItemStatusEnum.FAILED,
  UploadPieceItemStatusEnum.COMPLETED,
  UploadPieceItemStatusEnum.STARTED,
];
