import { RequestGenericInterface } from 'fastify';

export const internalServerError = {
  statusCode: '500',
  error: 'Internal',
  message: 'Internal Server Error',
};
export function createDefaultAuthSchema(successResponseSchema: any, properties: any): any {
  return {
    headers: { $ref: 'authSchema#' },
    response: {
      200: { description: 'Successful response', ...successResponseSchema },
      '4xx': { description: 'Error response', $ref: 'errorSchema#' },
    },
    ...properties,
  };
}

export interface AuthenticatedRequest extends RequestGenericInterface {
  Headers: {
    authorization: string;
  };
}
