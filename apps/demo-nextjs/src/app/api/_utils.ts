import { NextRequest, NextResponse } from 'next/server';

export type AuthParams = {
  _?: string;
};
export type HttpHandlerLogicType = (authParams?: AuthParams) => Promise<NextResponse>;

const accessDeniedResponse = NextResponse.json({ message: 'Access denied' }, { status: 403 });

export async function unauthorizedRequest(
  _request: NextRequest,
  _rootUserUid: string | undefined,
  logic: HttpHandlerLogicType,
): Promise<NextResponse> {
  return logic({});
}

export const presignedUrlExpiresIn = 4 * 3600;
