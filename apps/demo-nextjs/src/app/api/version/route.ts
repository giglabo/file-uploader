import { AppVersion } from '@/app/api/version/api-version';
import { logger } from '@/libs/Logger';
import { NextResponse } from 'next/server';

export async function GET(/*request: Request*/) {
  return NextResponse.json(AppVersion);
}
