import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-helpers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  const res = jsonResponse({ ok: true, message: 'Logged out' });
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}
