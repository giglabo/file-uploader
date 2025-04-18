import { FastifyInstance } from 'fastify';
import preCalculateChunks from './pre-calculate-chunks';
import createUpload from './create-upload';
import retrieveUrl from './retrieve-upload-url';
import uploadByUrl from './upload-by-url';
import completeFileUpload from './complete-file-upload';
import completeUpload from './complete-upload';
export default async function routes(fastify: FastifyInstance) {
  fastify.register(async function ctx(fastify) {
    fastify.register(preCalculateChunks);
    fastify.register(createUpload);
    fastify.register(retrieveUrl);
    fastify.register(uploadByUrl);
    fastify.register(completeFileUpload);
    fastify.register(completeUpload);
  });
}
