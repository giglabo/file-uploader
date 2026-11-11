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

// Client IP resolution (CF-Connecting-IP > first X-Forwarded-For > X-Real-IP > socket,
// configurable via CLIENT_IP_HEADERS) lives in ./ClientIp.
export { determineIp } from './ClientIp';
