import { NextRequest } from 'next/server';
import { prisma } from '@blutoken/database';
import { jsonResponse } from '@/lib/api-helpers';

export async function GET(_req: NextRequest) {
  try {
    const [
      activeProjectsCount,
      totalProjectsCount,
      retirementsCount,
      activeListingsCount,
      projectsAggregate,
      lastSync,
    ] = await Promise.all([
      prisma.project.count({ where: { status: 'Active' } }),
      prisma.project.count(),
      prisma.retirement.count(),
      prisma.listing.count({ where: { active: true } }),
      prisma.project.aggregate({
        _sum: {
          areaHa: true,
          totalMinted: true,
          totalRetired: true,
          bufferHeld: true,
        },
      }),
      prisma.syncState.findUnique({
        where: { key: 'last_processed_block' },
      }),
    ]);

    const totalMintedMilli = projectsAggregate._sum.totalMinted || 0n;
    const totalRetiredMilli = projectsAggregate._sum.totalRetired || 0n;
    const bufferHeldMilli = projectsAggregate._sum.bufferHeld || 0n;
    const totalAreaHa = projectsAggregate._sum.areaHa || 0;

    return jsonResponse({
      totalAreaHa: Number(totalAreaHa),
      totalMintedBlu: Number(totalMintedMilli) / 1000,
      totalRetiredBlu: Number(totalRetiredMilli) / 1000,
      totalBufferBlu: Number(bufferHeldMilli) / 1000,
      totalMintedMilli: totalMintedMilli.toString(),
      totalRetiredMilli: totalRetiredMilli.toString(),
      bufferHeldMilli: bufferHeldMilli.toString(),
      activeProjectsCount,
      totalProjectsCount,
      retirementsCount,
      activeListingsCount,
      lastSyncedBlock: lastSync ? lastSync.value : '0',
    });
  } catch (err: any) {
    return jsonResponse({
      totalAreaHa: 0,
      totalMintedBlu: 0,
      totalRetiredBlu: 0,
      totalBufferBlu: 0,
      totalMintedMilli: '0',
      totalRetiredMilli: '0',
      bufferHeldMilli: '0',
      activeProjectsCount: 0,
      totalProjectsCount: 0,
      retirementsCount: 0,
      activeListingsCount: 0,
      lastSyncedBlock: '0',
      error: err.message,
    });
  }
}
