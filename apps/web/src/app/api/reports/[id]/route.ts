import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = BigInt(id);

    const report = await prisma.mrvReport.findUnique({
      where: { id: reportId },
      include: {
        votes: true,
        project: {
          select: {
            id: true,
            name: true,
            ecosystem: true,
            stateCode: true,
            ownerWallet: true,
          },
        },
      },
    });

    if (!report) {
      return errorResponse(`MRV Report ${id} not found`, 404);
    }

    return jsonResponse(report);
  } catch (err: any) {
    return errorResponse(`Failed to fetch report: ${err.message}`, 400);
  }
}
