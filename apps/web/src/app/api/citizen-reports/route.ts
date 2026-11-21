import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, CitizenReportKind, CitizenReportStatus } from '@blutoken/database';
import { jsonResponse, errorResponse, parsePagination, parseBody } from '@/lib/api-helpers';
import { getSessionFromRequest } from '@/lib/auth';

const CreateCitizenReportSchema = z.object({
  projectId: z.union([z.string(), z.number()]).optional(),
  kind: z.nativeEnum(CitizenReportKind),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  description: z.string().min(5).max(2000),
  photoCids: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { cursor, limit } = parsePagination(url);

    const statusParam = url.searchParams.get('status');
    const kindParam = url.searchParams.get('kind');
    const projectIdParam = url.searchParams.get('projectId');

    const where: any = {};
    if (statusParam) {
      const match = Object.values(CitizenReportStatus).find(
        (s) => s.toLowerCase() === statusParam.toLowerCase()
      );
      if (match) where.status = match;
    }
    if (kindParam) {
      const match = Object.values(CitizenReportKind).find(
        (k) => k.toLowerCase() === kindParam.toLowerCase()
      );
      if (match) where.kind = match;
    }
    if (projectIdParam) {
      where.projectId = BigInt(projectIdParam);
    }

    const total = await prisma.citizenReport.count({ where });

    const queryOptions: any = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            stateCode: true,
          },
        },
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const reports = await prisma.citizenReport.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (reports.length > limit) {
      const nextItem = reports.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }

    // Anonymize coordinates for public view (2 decimal places ~ 1.1km jitter)
    const session = await getSessionFromRequest(req);
    const isElevated = session && (session.role === 'ADMIN' || session.role === 'VERIFIER');

    const sanitizedReports = reports.map((r) => ({
      ...r,
      lat: isElevated ? r.lat : Math.round(r.lat * 100) / 100,
      lng: isElevated ? r.lng : Math.round(r.lng * 100) / 100,
    }));

    return jsonResponse({
      items: sanitizedReports,
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

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, CreateCitizenReportSchema);
  if (!parsed.success) return parsed.response;

  const { projectId, kind, lat, lng, description, photoCids } = parsed.data;

  // Optional authenticated reporter
  const session = await getSessionFromRequest(req);

  try {
    const report = await prisma.citizenReport.create({
      data: {
        reporterWallet: session?.address || null,
        projectId: projectId ? BigInt(projectId) : null,
        kind,
        lat,
        lng,
        description,
        photoCids,
        status: CitizenReportStatus.NEW,
      },
    });

    return jsonResponse(report, 201);
  } catch (err: any) {
    return errorResponse(`Failed to create citizen report: ${err.message}`, 400);
  }
}
