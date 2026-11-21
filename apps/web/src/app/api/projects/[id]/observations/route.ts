import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = BigInt(id);

    const observations = await prisma.satelliteObservation.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    });

    return jsonResponse(observations);
  } catch (err: any) {
    return errorResponse(`Failed to fetch observations: ${err.message}`, 400);
  }
}
