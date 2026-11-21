import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse, parsePagination } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { cursor, limit } = parsePagination(url);

    const activeParam = url.searchParams.get('active');
    const active = activeParam !== null ? activeParam === 'true' : true;

    const projectIdParam = url.searchParams.get('projectId');
    const projectId = projectIdParam ? BigInt(projectIdParam) : undefined;

    const where: any = { active };
    if (projectId) where.projectId = projectId;

    const total = await prisma.listing.count({ where });

    const queryOptions: any = {
      where,
      take: limit + 1,
      orderBy: { id: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ecosystem: true,
            stateCode: true,
            coverImageCid: true,
          },
        },
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: BigInt(cursor) };
      queryOptions.skip = 1;
    }

    const listings = await prisma.listing.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (listings.length > limit) {
      const nextItem = listings.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    return jsonResponse({
      items: listings,
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
