import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

export enum OrgKind {
  NCCR = 'NCCR',
  MOEFCC = 'MOEFCC',
  NGO = 'NGO',
  COOP = 'COOP',
  INDUSTRY = 'INDUSTRY',
}

export enum Ecosystem {
  Mangrove = 'Mangrove',
  Seagrass = 'Seagrass',
  SaltMarsh = 'SaltMarsh',
}

export enum ProjectStatus {
  Pending = 'Pending',
  Active = 'Active',
  Suspended = 'Suspended',
  Closed = 'Closed',
}

export enum ReportStatus {
  Submitted = 'Submitted',
  Verified = 'Verified',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export enum CitizenReportKind {
  MANGROVE_LOSS = 'MANGROVE_LOSS',
  POLLUTION = 'POLLUTION',
  RECLAMATION = 'RECLAMATION',
  DEAD_ZONE = 'DEAD_ZONE',
  OTHER = 'OTHER',
}

export enum CitizenReportStatus {
  NEW = 'NEW',
  TRIAGED = 'TRIAGED',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
}

declare const process: {
  env: Record<string, string | undefined>;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Recursively converts BigInt values to string for safe JSON serialization.
 */
export function serializeBigInt<T>(obj: T): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
