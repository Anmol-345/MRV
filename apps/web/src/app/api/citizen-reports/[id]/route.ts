import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, CitizenReportStatus } from '@blutoken/database';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api-helpers';
import { getSessionFromRequest } from '@/lib/auth';

const PatchCitizenReportSchema = z.object({
  status: z.nativeEnum(CitizenReportStatus),
  anchoredHash: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'VERIFIER')) {
    return errorResponse('Forbidden: only admins or verifiers can update citizen reports', 403);
  }

  const { id } = await params;
  const parsed = await parseBody(req, PatchCitizenReportSchema);
  if (!parsed.success) return parsed.response;

  try {
    const updated = await prisma.citizenReport.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.anchoredHash ? { anchoredHash: parsed.data.anchoredHash } : {}),
      },
    });

    return jsonResponse(updated);
  } catch (err: any) {
    return errorResponse(`Failed to update report: ${err.message}`, 400);
  }
}
