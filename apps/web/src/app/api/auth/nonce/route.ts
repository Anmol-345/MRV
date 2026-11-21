import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';
import { generateNonce } from '@/lib/auth';

const NonceSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, NonceSchema);
  if (!parsed.success) return parsed.response;

  const { address } = parsed.data;
  const nonce = generateNonce(address);

  return jsonResponse({
    address,
    nonce,
    message: nonce,
  });
}
