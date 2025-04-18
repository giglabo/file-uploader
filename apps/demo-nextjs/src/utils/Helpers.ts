export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT}`;
};

export const determineIp = (request: Request): string | null | undefined => {
  return (
    request.headers?.get('x-real-ip') || // nginx
    request.headers?.get('x-client-ip') || // apache
    request.headers?.get('x-forwarded-for') || // use this only if you trust the header
    undefined
  );
};
