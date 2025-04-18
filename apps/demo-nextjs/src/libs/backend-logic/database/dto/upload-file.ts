import { Static, Type } from '@sinclair/typebox';

export const UploadFilePK = Type.Object({
  uploadFileUid: Type.String(),
});

export const UploadArchiveFilePK = Type.Object({
  uploadArchiveFileUid: Type.String(),
});

export const UploadFile = Type.Object({
  rootUserUid: Type.String(),
  statusUid: Type.String(),
  s3MultipartUploadKey: Type.String(),
  s3ObjectKey: Type.String(),
  downloadUrl: Type.String(),
  fileName: Type.String(),
  fileSize: Type.Number(),
  checksum: Type.String(),
  checksumAlgorithm: Type.String(),
  metaData: Type.Any(),
  created: Type.Date(),
  updated: Type.Date(),
});

export type UploadFile = Static<typeof UploadFile>;
export type UploadFilePK = Static<typeof UploadFilePK>;
export type UploadArchiveFilePK = Static<typeof UploadArchiveFilePK>;
