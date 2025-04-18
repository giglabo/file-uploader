import { FastifyInstance } from 'fastify';

export const chunkSize = 25 * 1024 * 1024;
// export const chunkSize = 300 * 1024;
export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });
}
