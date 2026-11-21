import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@blutoken/database';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';

const MrvCallbackSchema = z.object({
  projectId: z.union([z.string(), z.number()]),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  source: z.string().default('Sentinel-2'),
  ndviMean: z.number().min(-1).max(1),
  canopyHa: z.number().nonnegative(),
  waterHa: z.number().nonnegative(),
  cloudPct: z.number().min(0).max(100),
  rasterCid: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get('x-mrv-secret');
  const expectedSecret =
    process.env.MRV_SHARED_SECRET ||
    process.env.MRV_WORKER_SECRET ||
    'dev_mrv_shared_secret';

  if (!secretHeader || secretHeader !== expectedSecret) {
    return errorResponse('Unauthorized: Invalid or missing X-MRV-Secret header', 401);
  }

  const parsed = await parseBody(req, MrvCallbackSchema);
  if (!parsed.success) return parsed.response;

  const { projectId, date, source, ndviMean, canopyHa, waterHa, cloudPct, rasterCid } =
    parsed.data;

  try {
    const observation = await prisma.satelliteObservation.create({
      data: {
        projectId: BigInt(projectId),
        date: new Date(date),
        source,
        ndviMean,
        canopyHa,
        waterHa,
        cloudPct,
        rasterCid: rasterCid || null,
      },
    });

    return jsonResponse(
      {
        ok: true,
        observationId: observation.id,
        projectId: observation.projectId.toString(),
      },
      201
    );
  } catch (err: any) {
    return errorResponse(`Failed to record satellite observation: ${err.message}`, 400);
  }
}
