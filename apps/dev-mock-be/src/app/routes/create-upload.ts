import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';
import { v4 as uuid } from 'uuid';
import { chunkSize } from './root';

const requestBodySchema = {
  title: 'Create Upload Chunks',
  type: 'object',
  properties: {
    internalUploadId: {
      type: 'string',
    },
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          relationId: {
            type: 'string',
          },
          checksum: {
            type: 'string',
          },
          checksumAlgorithm: {
            type: 'string',
            enum: ['sha-1', 'sha-256', 'md5', 'crc32', 'crc32c', 'custom'],
          },
          name: {
            type: 'string',
          },
          size: {
            type: 'number',
          },
        },
        required: ['relationId', 'checksum', 'checksumAlgorithm', 'name', 'size'],
      },
    },
  },
  additionalProperties: true,
  required: ['relationId', 'files'],
} as const;

const successResponseSchema = {
  type: 'object',
  properties: {
    relationId: {
      type: 'string',
    },
    uploadId: {
      type: 'string',
    },
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          relationId: {
            type: 'string',
          },
          fileId: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['completed', 'missed'],
          },
          chunks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: {
                  type: 'number',
                },
                start: {
                  type: 'number',
                },
                end: {
                  type: 'number',
                },
                status: {
                  type: 'string',
                  enum: ['completed', 'missed', 'missing'],
                },
              },
              required: ['index', 'start', 'end', 'status'],
            },
          },
        },
        required: ['relationId', 'fileId', 'chunks', 'status'],
      },
    },
  },
  required: ['files', 'relationId', 'uploadId'],
};

interface RequestInterface extends AuthenticatedRequest {
  Body: FromSchema<typeof requestBodySchema>;
}

export default async function routes(fastify: FastifyInstance) {
  const createChunks = (size: number) => {
    const chunks: { index: number; start: number; end: number }[] = [];

    for (let start = 0, end = chunkSize; start < size; start += chunkSize, end += chunkSize) {
      if (end > size) end = size;
      const chunkNumber = Math.floor(start / chunkSize);
      chunks.push({ index: chunkNumber, start, end });
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
    '/uploads',
    {
      schema,
    },
    async (request, response) => {
      try {
        return response.status(200).send({
          uploadId: uuid(),
          relationId: request.body.relationId,
          files: request.body.files.map((x) => {
            return {
              relationId: x.relationId,
              fileId: uuid(),
              status: 'not-completed',
              chunks: createChunks(x.size).map((c) => {
                return { ...c, status: 'missing' };
              }),
            };
          }),
        });
      } catch (err) {
        request.log.error({ error: err }, 'unable to create upload');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
