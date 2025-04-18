import { BaseUploadItem, FileMetaData, HashType, OutputFileHashMetaData } from '@giglabo/shared';

export interface UploadItem extends BaseUploadItem {
  internalId: string;
  internalUploadId: string;
  hash: string;
  hashType: HashType;
  pieceIds: string[];
}

export interface UpdateUploadItem {
  internalId: string;
  update: Partial<UploadItem>;
}

export type InputUploadFileMetaData = FileMetaData & OutputFileHashMetaData & { internalUploadId: string };
