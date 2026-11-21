import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@blutoken/database';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';
import { getSessionFromRequest } from '@/lib/auth';

const RegisterDeviceSchema = z.object({
  id: z.string().min(3).max(64),
  projectId: z.union([z.string(), z.number()]),
  publicKey: z.string().min(32),
  kind: z.string().min(2).max(64),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return errorResponse('Authentication required to register device', 401);
  }

  const parsed = await parseBody(req, RegisterDeviceSchema);
  if (!parsed.success) return parsed.response;

  const { id, projectId, publicKey, kind, lat, lng } = parsed.data;

  try {
    const device = await prisma.sensorDevice.upsert({
      where: { id },
      create: {
        id,
        projectId: BigInt(projectId),
        publicKey,
        kind,
        lat,
        lng,
        status: 'ACTIVE',
      },
      update: {
        publicKey,
        kind,
        lat,
        lng,
        status: 'ACTIVE',
      },
    });

    return jsonResponse(device, 201);
  } catch (err: any) {
    return errorResponse(`Failed to register device: ${err.message}`, 400);
  }
}
