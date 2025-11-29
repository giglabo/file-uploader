import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes liveness probe
 * Returns a simple OK response to indicate the application is running
 */
export async function GET() {
  return NextResponse.json({ status: 'OK' }, { status: 200 });
}
