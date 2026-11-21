import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse, parsePagination } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { cursor, limit } = parsePagination(url);

    const service = url.searchParams.get('service') || undefined;
    const name = url.searchParams.get('name') || undefined;
    const fromBlock = url.searchParams.get('fromBlock');
    const toBlock = url.searchParams.get('toBlock');

    const where: any = {};
    if (service) where.service = service;
    if (name) where.name = name;
    if (fromBlock || toBlock) {
      where.blockNumber = {};
      if (fromBlock) where.blockNumber.gte = BigInt(fromBlock);
      if (toBlock) where.blockNumber.lte = BigInt(toBlock);
    }

    const total = await prisma.chainEvent.count({ where });

    const queryOptions: any = {
      where,
      take: limit + 1,
      orderBy: [{ blockNumber: 'desc' }, { eventIndex: 'desc' }],
    };

    if (cursor) {
      queryOptions.cursor = { id: BigInt(cursor) };
      queryOptions.skip = 1;
    }

    const events = await prisma.chainEvent.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem ? nextItem.id.toString() : null;
    }

    return jsonResponse({
      items: events,
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
