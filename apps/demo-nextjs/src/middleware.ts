import { MiddlewareFactory, stackMiddlewares } from '@/middlewares/stackHandler';
import { withMainContent } from '@/middlewares/mainContent';
import { withApiMiddleware } from '@/app/api/api-middleware';

const middlewares: MiddlewareFactory[] = [withMainContent, withApiMiddleware];
export default stackMiddlewares(middlewares);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json|xml)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/$',
  ],
};
