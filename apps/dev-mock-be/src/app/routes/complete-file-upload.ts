import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';

const requestObjectParamsSchema = {
  type: 'object',
  properties: {
    uploadId: { type: 'string', examples: ['uuid v4'] },
    uploadEntityId: { type: 'string', examples: ['uuid v4'] },
  },
  required: ['*'],
} as const;

const successResponseSchema = {
  type: 'object',
  properties: {},
  required: [],
};

interface RequestInterface extends AuthenticatedRequest {
  Params: FromSchema<typeof requestObjectParamsSchema>;
}

export default async function routes(fastify: FastifyInstance) {
  const summary = 'Complete file upload';

  const schema = createDefaultAuthSchema(successResponseSchema, {
    allowUnionTypes: true,
    summary,
    tags: ['upload'],
  });

  fastify.post<RequestInterface>(
    '/upload/:uploadId/files/:uploadEntityId/complete',
    {
      schema,
    },
    async (request, response) => {
      try {
        const objectName = request.params['*'];
        request.log.info({ data: objectName }, 'complete file');

        return response.status(204).send({});
      } catch (err) {
        request.log.error({ error: err }, 'unable to complete a file');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
