import { AppVersion } from '@/app/api/version/api-version';
import { logger } from '@/libs/Logger';
import { NextResponse } from 'next/server';

export async function GET(/*request: Request*/) {
  logger.debug('Test version log');
  return NextResponse.json(AppVersion);
}
