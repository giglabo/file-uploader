import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';

/**
 * Status check endpoint for Kubernetes readiness probe
 * Checks if the application is ready to serve traffic by verifying:
 * - Application is running
 * - Environment configuration
 *
 * Returns 200 if ready, 503 if not ready (for Kubernetes to handle)
 */
export async function GET() {
  const checks: Record<string, string> = {
    application: 'OK',
  };

  let overallStatus = 'OK';
  let statusCode = 200;

  // Check environment configuration (critical)
  if (!Env.NEXT_PUBLIC_APP_URL) {
    checks.config = 'MISSING';
    overallStatus = 'NOT_READY';
    statusCode = 503;
  } else {
    checks.config = 'OK';
  }

  return NextResponse.json(
    {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}
