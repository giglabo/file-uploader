import { MiddlewareFactory } from '@/middlewares/stackHandler';
import { NextFetchEvent, NextRequest } from 'next/server';

export const withApiMiddleware: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    return next(request, event);
  };
};
