import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';
import {
  getExpectedNonce,
  clearNonce,
  verifyWalletSignature,
  createSessionToken,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';

const VerifySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  signature: z.string().min(1, 'Signature is required'),
  nonce: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, VerifySchema);
  if (!parsed.success) return parsed.response;

  const { address, signature, nonce: providedNonce } = parsed.data;
  const expectedNonce = getExpectedNonce(address) || providedNonce;

  if (!expectedNonce) {
    return errorResponse('Nonce expired or not found. Please request a new nonce.', 400);
  }

  const isValid = verifyWalletSignature(address, signature, expectedNonce);
  if (!isValid) {
    return errorResponse('Invalid signature for address', 401);
  }

  // Nonce used; clear it
  clearNonce(address);

  // Determine role: check env for admin or verifier
  const adminAddress = (process.env.ADMIN_ADDRESS || '').toLowerCase();
  const verifierAddresses = (process.env.VERIFIER_ADDRESSES || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim());

  let role = 'USER';
  const cleanAddr = address.toLowerCase();
  if (adminAddress && cleanAddr === adminAddress) {
    role = 'ADMIN';
  } else if (verifierAddresses.includes(cleanAddr)) {
    role = 'VERIFIER';
  }

  const token = await createSessionToken(address, role);

  const res = jsonResponse({
    ok: true,
    address,
    role,
    token,
  });

  // Set httpOnly cookie
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return res;
}
