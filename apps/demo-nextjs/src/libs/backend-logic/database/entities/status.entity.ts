import { EntitySchema } from 'typeorm';
import { baseIDSchemaPart } from '../database-common';
import { Status } from '../dto';

export type StatusSchema = Status;

export const StatusEntity = new EntitySchema<StatusSchema>({
  name: `statuses`,
  columns: {
    ...baseIDSchemaPart('statusUid', 'status_uid'),
    code: {
      type: String,
      nullable: false,
    },
    name: {
      type: String,
      nullable: false,
    },
  },
  relations: {},
});
