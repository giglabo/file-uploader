import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';
import { v4 as uuid } from 'uuid';

const requestObjectParamsSchema = {
  type: 'object',
  properties: {
    entityId: { type: 'string', examples: ['uuid v4'] },
    filePkId: { type: 'string', examples: ['uuid v4'] },
    chunkNumber: { type: 'number', examples: ['0,1,2,3...n'] },
  },
  required: ['filePkId', 'chunkNumber'],
} as const;

const requestBodySchema = {
  title: 'Create Upload Url',
  type: 'object',
  properties: {
    chunkNumber: {
      type: 'integer',
    },
    filePkId: {
      type: 'string',
      format: 'uuid',
    },
    hashType: {
      type: 'string',
    },
    hash: {
      type: 'string',
    },
  },
  // required: ['chunkNumber', 'hashType', 'hash'],
} as const;

const successResponseSchema = {
  type: 'object',
  properties: {
    presignedUrl: {
      type: 'string',
    },
  },
  required: ['presignedUrl'],
};

interface RequestInterface extends AuthenticatedRequest {
  Params: FromSchema<typeof requestObjectParamsSchema>;
  Body: FromSchema<typeof requestBodySchema>;
}

export default async function routes(fastify: FastifyInstance) {
  const chunkSize = 100 * 1024;
  const createChunks = (size: number) => {
    const chunks: { chunkNumber: number; start: number; end: number }[] = [];

    for (let start = 0, end = chunkSize; start < size; start += chunkSize, end += chunkSize) {
      if (end > size) end = size;
      const chunkNumber = Math.floor(start / chunkSize);
      chunks.push({ chunkNumber, start, end });
    }

    return chunks;
  };
  const summary = 'Create upload';

  const schema = createDefaultAuthSchema(successResponseSchema, {
    allowUnionTypes: true,
    body: requestBodySchema,
    summary,
    tags: ['upload'],
  });

  fastify.post<RequestInterface>(
    '/uploads/:entityId/files/:filePkId/chunks/:chunkNumber/presigned-url',
    {
      schema,
    },
    async (request, response) => {
      try {
        return response.status(200).send({
          presignedUrl: `/api/v3/upload/${request.params.filePkId}/upload-${request.params.chunkNumber}`,
        });
      } catch (err) {
        request.log.error({ error: err }, 'unable to create upload');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
