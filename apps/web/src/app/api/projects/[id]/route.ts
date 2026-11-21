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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        beneficiaries: true,
        organization: true,
        reports: {
          include: { votes: true },
          orderBy: { createdAt: 'desc' },
        },
        devices: true,
        listings: {
          where: { active: true },
        },
      },
    });

    if (!project) {
      return errorResponse(`Project ${id} not found`, 404);
    }

    return jsonResponse(project);
  } catch (err: any) {
    return errorResponse(`Failed to fetch project: ${err.message}`, 400);
  }
}
