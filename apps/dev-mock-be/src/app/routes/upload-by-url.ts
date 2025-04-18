import { FastifyInstance, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { AuthenticatedRequest, createDefaultAuthSchema, internalServerError } from '../shared';
import { v4 as uuid } from 'uuid';
import { logger } from 'nx/src/utils/logger';
import { createMD5 } from 'hash-wasm';

const requestObjectParamsSchema = {
  type: 'object',
  properties: {
    '*': { type: 'string', examples: ['tail of uploading'] },
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

interface UploaderOptions {
  fileSizeLimit?: number | null;
  allowedMimeTypes?: string[] | null;
}

export default async function routes(fastify: FastifyInstance) {
  const summary = 'Simple upload';

  const schema = createDefaultAuthSchema(successResponseSchema, {
    allowUnionTypes: true,
    summary,
    tags: ['upload'],
  });

  const incomingFileInfo = async (request: FastifyRequest, options?: Pick<UploaderOptions, 'fileSizeLimit'>) => {
    const fileSizeLimit = options?.fileSizeLimit || 5 * 1024 * 1024;

    // just assume it's a binary file
    const body: NodeJS.ReadableStream = request.raw;
    const mimeType = request.headers['content-type'] || 'application/octet-stream';
    const cacheControl = request.headers['cache-control'] ?? 'no-cache';
    const isTruncated = () => {
      return Number(request.headers['content-length']) > fileSizeLimit;
    };

    return {
      body,
      mimeType,
      cacheControl,
      isTruncated,
    };
  };

  fastify.addContentTypeParser(['application/json', 'text/plain'], function (request, payload, done) {
    done(null);
  });

  fastify.put<RequestInterface>(
    '/*',
    {
      schema,
    },
    async (request, response) => {
      const base64ToHex = (base64: string): string => {
        const bytes = Buffer.from(base64, 'base64');
        return bytes.toString('hex');
      };

      try {
        const objectName = request.params['*'];

        const file = await incomingFileInfo(request, {});

        const hasher = await createMD5();
        hasher.init();
        for await (const chunk of file.body) {
          hasher.update(chunk);
        }

        const uploadedHash = hasher.digest();

        const headerB64 = request.headers['content-md5'];
        let md5Hex: string;
        if (headerB64) {
          md5Hex = base64ToHex(headerB64 as string);
          if (md5Hex !== uploadedHash) {
            throw 'md5 failed';
          }
          logger.info(`Uploaded ${objectName} => md5 = ${uploadedHash} request.headers['content-md5']: ${headerB64} => ${md5Hex} `);
        } else {
          logger.info(`Uploaded ${objectName} => md5 = ${uploadedHash}`);
        }
        return response.status(204).send({});
      } catch (err) {
        request.log.error({ error: err }, 'unable to upload');
        return response.status(500).send(internalServerError);
      }
    },
  );
}
