/**
 * BluToken Chain Client
 * 
 * Provides type definitions, constants, and utilities for interacting
 * with the on-chain BluToken Sails program on Vara Network.
 */

export const BLU_DECIMALS = 3;
export const MILLI_PER_BLU = 1000n;
export const PLANCK_PER_VARA = 1_000_000_000_000n;

export enum Ecosystem {
  Mangrove = 'Mangrove',
  Seagrass = 'Seagrass',
  SaltMarsh = 'SaltMarsh',
}

export enum Role {
  Admin = 'Admin',
  Verifier = 'Verifier',
  ProjectOwner = 'ProjectOwner',
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

/**
 * Format milli-BLU (u128) to human-readable BLU (tCO2e)
 */
export function formatBlu(milliBlu: bigint): string {
  const whole = milliBlu / MILLI_PER_BLU;
  const fraction = milliBlu % MILLI_PER_BLU;
  return `${whole.toString()}.${fraction.toString().padStart(3, '0')}`;
}

/**
 * Format VARA in planck (u128) to human-readable VARA string
 */
export function formatVara(planck: bigint): string {
  const whole = planck / PLANCK_PER_VARA;
  const fraction = (planck % PLANCK_PER_VARA) / 1_000_000_000n; // 3 decimal places
  return `${whole.toString()}.${fraction.toString().padStart(3, '0')}`;
}

/**
 * Convert human-readable BLU (tCO2e) to milli-BLU integer
 */
export function parseBlu(bluAmount: string): bigint {
  const [wholeStr, fractionStr = ''] = bluAmount.split('.');
  const whole = BigInt(wholeStr || '0') * MILLI_PER_BLU;
  const paddedFraction = fractionStr.padEnd(3, '0').slice(0, 3);
  const fraction = BigInt(paddedFraction || '0');
  return whole + fraction;
}
