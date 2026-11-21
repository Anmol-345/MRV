import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@blutoken/database';
import { signatureVerify } from '@polkadot/util-crypto';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';

const SensorReadingSchema = z.object({
  deviceId: z.string().min(1),
  timestamp: z.number().int().positive(),
  nonce: z.string().min(4),
  value: z.number(),
  unit: z.string().min(1),
  signature: z.string().min(1),
});

// Cache recently seen nonces to prevent replay attacks within time window
const seenNonces = new Map<string, number>();

function isReplay(nonceKey: string, now: number): boolean {
  // Purge expired nonces (> 15 mins)
  for (const [key, exp] of seenNonces.entries()) {
    if (now > exp) {
      seenNonces.delete(key);
    }
  }

  if (seenNonces.has(nonceKey)) {
    return true;
  }
  seenNonces.set(nonceKey, now + 15 * 60 * 1000);
  return false;
}

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, SensorReadingSchema);
  if (!parsed.success) return parsed.response;

  const { deviceId, timestamp, nonce, value, unit, signature } = parsed.data;
  const now = Date.now();

  // 1. Check time drift (allow up to 15 minutes clock skew)
  if (Math.abs(now - timestamp) > 15 * 60 * 1000) {
    return errorResponse('Timestamp outside acceptable drift window (15 minutes)', 400);
  }

  // 2. Anti-replay nonce check
  const nonceKey = `${deviceId}:${nonce}`;
  if (isReplay(nonceKey, now)) {
    return errorResponse('Duplicate reading nonce detected (replay attack prevention)', 409);
  }

  // 3. Find registered device and verify signature
  const device = await prisma.sensorDevice.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    return errorResponse(`Device '${deviceId}' is not registered`, 404);
  }

  if (device.status !== 'ACTIVE') {
    return errorResponse(`Device '${deviceId}' is inactive or suspended`, 403);
  }

  const message = `${deviceId}:${timestamp}:${nonce}:${value}:${unit}`;
  let isValid = false;

  try {
    const verified = signatureVerify(message, signature, device.publicKey);
    isValid = verified.isValid;
  } catch (err: any) {
    console.warn(`[Sensor Ingest] Signature verification exception for ${deviceId}:`, err);
  }

  if (!isValid) {
    return errorResponse('Invalid ed25519 signature for sensor payload', 401);
  }

  // 4. Store sensor reading and update device lastSeen
  try {
    const reading = await prisma.sensorReading.create({
      data: {
        deviceId,
        ts: new Date(timestamp),
        value,
        unit,
        signatureOk: true,
      },
    });

    await prisma.sensorDevice.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() },
    });

    return jsonResponse(
      {
        ok: true,
        readingId: reading.id.toString(),
        deviceId,
        ts: reading.ts,
      },
      201
    );
  } catch (err: any) {
    return errorResponse(`Failed to persist sensor reading: ${err.message}`, 500);
  }
}
