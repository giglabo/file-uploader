import type { NextFetchEvent, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/libs/i18nNavigation';
import { MiddlewareFactory } from '@/middlewares/stackHandler';

export const withMainContent: MiddlewareFactory = (next) => {
  const intlMiddleware = createMiddleware(routing);
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;
    if (['/api', '/trpc']?.some((path) => pathname.startsWith(path))) {
      return next(request, event);
    } else if (['/robots.txt', '/sitemap.xml']?.some((path) => pathname.startsWith(path))) {
      return next(request, event);
    } else {
      return intlMiddleware(request);
    }
  };
};
