import { UploadEntityStatusEnum, UploadMetaData } from '@giglabo/shared';

export type UploadEntity = {
  id: string;
  uploadItems: string[];
  force: boolean;
  metaData: UploadMetaData;
  status: UploadEntityStatusEnum;
  pkId?: string;
  errorCode?: string;
  errorMessage?: string;
  errorData?: any;
};

export interface UploadEntityState {
  entities: Record<string, UploadEntity>;
  ids: string[];
}
