import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serializeBigInt } from '@blutoken/database';

export const PILOT_DISCLAIMER = 'BluTokens are pilot registry tokens, not government-certified credits.';

export function jsonResponse(data: unknown, status = 200, init?: ResponseInit): NextResponse {
  const serialized = serializeBigInt(data);
  const response = NextResponse.json(serialized, { status, ...init });
  response.headers.set('X-BluToken-Notice', PILOT_DISCLAIMER);
  return response;
}

export function errorResponse(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details,
      notice: PILOT_DISCLAIMER,
    },
    { status }
  );
}

export function parsePagination(url: URL): { cursor?: string; limit: number } {
  const cursor = url.searchParams.get('cursor') || undefined;
  const rawLimit = parseInt(url.searchParams.get('limit') || '20', 10);
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), 100);
  return { cursor, limit };
}

export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const raw = await req.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      return {
        success: false,
        response: errorResponse('Validation failed', 400, result.error.format()),
      };
    }
    return { success: true, data: result.data };
  } catch (err: any) {
    return {
      success: false,
      response: errorResponse('Invalid JSON body', 400, err.message),
    };
  }
}

export function parseQuery<T>(
  req: Request,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const url = new URL(req.url);
  const queryObj: Record<string, string> = {};
  url.searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });

  const result = schema.safeParse(queryObj);
  if (!result.success) {
    return {
      success: false,
      response: errorResponse('Invalid query parameters', 400, result.error.format()),
    };
  }
  return { success: true, data: result.data };
}
