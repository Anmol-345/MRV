import { NextRequest } from 'next/server';
import { prisma, Ecosystem, ProjectStatus } from '@blutoken/database';
import { jsonResponse, parsePagination } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { cursor, limit } = parsePagination(url);

    const stateCode = url.searchParams.get('state') || undefined;
    const rawEcosystem = url.searchParams.get('ecosystem');
    const rawStatus = url.searchParams.get('status');

    let ecosystem: Ecosystem | undefined;
    if (rawEcosystem) {
      const match = Object.values(Ecosystem).find(
        (e) => e.toLowerCase() === rawEcosystem.toLowerCase()
      );
      if (match) ecosystem = match;
    }

    let status: ProjectStatus | undefined;
    if (rawStatus) {
      const match = Object.values(ProjectStatus).find(
        (s) => s.toLowerCase() === rawStatus.toLowerCase()
      );
      if (match) status = match;
    }

    const where: any = {};
    if (stateCode) where.stateCode = stateCode.toUpperCase();
    if (ecosystem) where.ecosystem = ecosystem;
    if (status) where.status = status;

    const total = await prisma.project.count({ where });

    const queryOptions: any = {
      where,
      take: limit + 1,
      orderBy: { id: 'asc' },
      include: {
        beneficiaries: true,
        organization: true,
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: BigInt(cursor) };
      queryOptions.skip = 1;
    }

    const projects = await prisma.project.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (projects.length > limit) {
      const nextItem = projects.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    return jsonResponse({
      items: projects,
      nextCursor,
      total,
    });
  } catch (err: any) {
    return jsonResponse({
      items: [],
      nextCursor: null,
      total: 0,
      error: err.message,
    });
  }
}
