import { DatesModelSchemaFunc, RootUserModelSchema, StatusModelSchema } from '../base-model';
import { Static, Type } from '@sinclair/typebox';

export const Status = Type.Object({
  ...StatusModelSchema,
  code: Type.String(),
  name: Type.String(),
});

export type Status = Static<typeof Status>;
