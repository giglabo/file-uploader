import { Type } from '@sinclair/typebox';

export type BaseModel<T> = {
  id: T;
  created: string;
  updated: string;
};

export const DatesModelSchemaFunc = () => {
  return {
    created: Type.String(),
    updated: Type.String(),
  };
};

export const RootUserModelSchema = {
  rootUserUid: Type.String(),
};

export const StatusModelSchema = {
  statusUid: Type.String(),
};
