import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const retirementId = BigInt(id);

    const retirement = await prisma.retirement.findUnique({
      where: { id: retirementId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ecosystem: true,
            stateCode: true,
            boundaryCid: true,
          },
        },
      },
    });

    if (!retirement) {
      return errorResponse(`Retirement record ${id} not found`, 404);
    }

    return jsonResponse(retirement);
  } catch (err: any) {
    return errorResponse(`Failed to fetch retirement: ${err.message}`, 400);
  }
}
