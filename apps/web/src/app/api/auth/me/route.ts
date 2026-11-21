import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  return jsonResponse({
    address: session.address,
    role: session.role,
  });
}
