export const errorSchema = {
  $id: 'errorSchema',
  type: 'object',
  properties: {
    statusCode: { type: 'string' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['statusCode', 'error', 'message'],
} as const;

export const authSchema = {
  $id: 'authSchema',
  type: 'object',
  properties: {
    authorization: {
      type: 'string',
      examples: ['Bearer <token value>'],
    },
  },
  // required: ['authorization'],
} as const;
