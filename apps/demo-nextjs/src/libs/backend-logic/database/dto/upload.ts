import { Static, Type } from '@sinclair/typebox';

export const UploadPK = Type.Object({
  uploadUid: Type.String(),
});

export const UploadArchivePK = Type.Object({
  uploadArchiveUid: Type.String(),
});

export const Upload = Type.Object({
  rootUserUid: Type.String(),
  hash: Type.String(),
  metaData: Type.Any(),
  statusUid: Type.String(),
  created: Type.Date(),
  updated: Type.Date(),
});

export type Upload = Static<typeof Upload>;
export type UploadPK = Static<typeof UploadPK>;
export type UploadArchivePK = Static<typeof UploadArchivePK>;
