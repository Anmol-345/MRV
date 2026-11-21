import { SignJWT, jwtVerify } from 'jose';
import { signatureVerify } from '@polkadot/util-crypto';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'blutoken_default_secure_secret_must_be_32_chars_min_key'
);

export const AUTH_COOKIE_NAME = 'blutoken_token';

// In-memory nonce store with TTL (5 mins)
interface NonceEntry {
  nonce: string;
  expiresAt: number;
}
const nonceStore = new Map<string, NonceEntry>();

export function generateNonce(address: string): string {
  const nonce = `Sign this message to authenticate with BluToken:\nNonce: ${crypto.randomBytes(16).toString('hex')}\nIssued: ${new Date().toISOString()}`;
  nonceStore.set(address.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
  });
  return nonce;
}

export function getExpectedNonce(address: string): string | null {
  const entry = nonceStore.get(address.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    nonceStore.delete(address.toLowerCase());
    return null;
  }
  return entry.nonce;
}

export function clearNonce(address: string): void {
  nonceStore.delete(address.toLowerCase());
}

export function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): boolean {
  try {
    const res = signatureVerify(message, signature, address);
    return res.isValid;
  } catch (err) {
    console.warn(`[verifyWalletSignature] Verification failed for ${address}:`, err);
    return false;
  }
}

export async function createSessionToken(address: string, role = 'USER'): Promise<string> {
  return await new SignJWT({ sub: address, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<{ address: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub) return null;
    return {
      address: payload.sub,
      role: (payload.role as string) || 'USER',
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  req: Request
): Promise<{ address: string; role: string } | null> {
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const match = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (match) {
      token = match.substring(AUTH_COOKIE_NAME.length + 1);
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}
