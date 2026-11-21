/**
 * Formatting helpers for BluToken
 * Integer-only carbon and currency math per AGENTS.md Hard Rule 4
 */

export function formatBlu(milli: bigint | string | number | null | undefined): string {
  if (milli == null) return '0.000';
  const val = typeof milli === 'bigint' ? milli : BigInt(Math.floor(Number(milli) || 0));
  const isNegative = val < 0n;
  const abs = isNegative ? -val : val;
  const whole = abs / 1000n;
  const fraction = abs % 1000n;
  const fractionStr = fraction.toString().padStart(3, '0');
  const sign = isNegative ? '-' : '';
  return `${sign}${whole.toLocaleString('en-IN')}.${fractionStr}`;
}

export function formatVara(planck: bigint | string | number | null | undefined): string {
  if (planck == null) return '0.00';
  const val = typeof planck === 'bigint' ? planck : BigInt(Math.floor(Number(planck) || 0));
  const isNegative = val < 0n;
  const abs = isNegative ? -val : val;
  const whole = abs / 1_000_000_000_000n;
  const fraction = (abs % 1_000_000_000_000n) / 10_000_000_000n; // 2 decimal places
  const fractionStr = fraction.toString().padStart(2, '0');
  const sign = isNegative ? '-' : '';
  return `${sign}${whole.toLocaleString('en-IN')}.${fractionStr}`;
}

export function formatNumber(n: number | string | bigint | null | undefined): string {
  if (n == null) return '0';
  const num = typeof n === 'bigint' ? Number(n) : Number(n);
  return isNaN(num) ? '0' : num.toLocaleString('en-IN');
}

export function truncateAddress(address: string | null | undefined, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
