import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';
import { chunkSize } from './root';

const requestBodySchema = {
  title: 'Precalculate Chunks',
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          relationId: {
            type: 'string',
          },
          size: {
            type: 'integer',
            minimum: 0,
          },
        },
        required: ['relationId', 'size'],
      },
    },
  },
  required: ['files'],
} as const;

const successResponseSchema = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          relationId: {
            type: 'string',
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
              },
              required: ['index', 'start', 'end'],
            },
          },
        },
        required: ['relationId', 'chunks'],
      },
    },
  },
  required: ['files'],
};

interface requestInterface extends AuthenticatedRequest {
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
  const summary = 'Precalculate chunks';

  const schema = createDefaultAuthSchema(successResponseSchema, {
    allowUnionTypes: true,
    body: requestBodySchema,
    summary,
    tags: ['upload'],
  });

  fastify.post<requestInterface>(
    '/chunks',
    {
      schema,
    },
    async (request, response) => {
      try {
        return response.status(200).send({
          files: request.body.files.map((x) => {
            return {
              relationId: x.relationId,
              chunks: createChunks(x.size),
            };
          }),
        });
      } catch (err) {
        request.log.error({ error: err }, 'unable to create chunks');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
