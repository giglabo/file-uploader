import { MiddlewareFactory } from '@/middlewares/stackHandler';
import type { NextFetchEvent, NextRequest } from 'next/server';

export const stubMiddleware: MiddlewareFactory = (next) => {
  return (request: NextRequest, event: NextFetchEvent) => {
    return next(request, event);
  };
};
