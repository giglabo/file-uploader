import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { authSchema, errorSchema } from './schemas/schemas';
import { fastifyMultipart } from '@fastify/multipart';
import fastifyRawBody from 'fastify-raw-body';

import formBody from '@fastify/formbody';
import qs from 'qs';
import root from './routes/root';
import upload from './routes/upload';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Mock BE Dev API',
        description: 'API documentation',
        version: '0.0.1',
      },
      tags: [{ name: 'upload', description: 'Upload end-points' }],
    },
  });
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
  });

  // add in common schemas
  fastify.addSchema(authSchema);
  fastify.addSchema(errorSchema);

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  await fastify.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
    routes: [],
  });
  await fastify.register(formBody, { parser: (str) => qs.parse(str) });

  // fastify.register(fastifyMultipart, {
  //   addToBody: true,
  //   limits: {
  //     fields: 10,
  //     files: 1,
  //   },
  //   throwFileSizeLimit: false,
  // });

  fastify.addContentTypeParser('*', function (request, payload, done) {
    done(null);
  });

  // routes
  fastify.register(root, { prefix: '/api/v3' });
  fastify.register(upload, { prefix: '/api/v3' });
}
