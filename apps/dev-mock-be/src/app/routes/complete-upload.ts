import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';

const requestObjectParamsSchema = {
  type: 'object',
  properties: {
    uploadId: { type: 'string', examples: ['tail of complete upload'] },
  },
  required: ['uploadId'],
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
  const summary = 'Complete upload';

  const schema = createDefaultAuthSchema(successResponseSchema, {
    allowUnionTypes: true,
    summary,
    tags: ['upload'],
  });

  fastify.post<RequestInterface>(
    '/upload/:uploadId/complete',
    {
      schema,
    },
    async (request, response) => {
      try {
        const objectName = request.params['*'];
        request.log.info({ data: objectName }, 'complete upload');

        return response.status(204).send({});
      } catch (err) {
        request.log.error({ error: err }, 'unable to commit file');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
