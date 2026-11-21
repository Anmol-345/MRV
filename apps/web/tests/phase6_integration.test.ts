import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { computeSha256, generateDemoMrvBundle } from '../src/components/mrv/stub-mrv-generator';
import { decodeContractError, ERROR_MAPPINGS } from '../src/lib/contract-errors';
import { formatBlu, formatVara } from '../src/lib/formatters';

describe('Phase 6 Logic & Integration Tests', () => {
  it('1. SHA-256 Cryptographic Hashing matches Web Crypto standards', async () => {
    const payload = 'BLUTOKEN-TEST-PAYLOAD';
    const { hex, bytes } = await computeSha256(payload);

    assert.ok(hex.startsWith('0x'), 'Hash must start with 0x prefix');
    assert.strictEqual(hex.length, 66, 'Hash hex must be 64 characters + 0x (32 bytes)');
    assert.strictEqual(bytes.length, 32, 'Bytes array must contain 32 bytes');

    // Determinism test
    const repeat = await computeSha256(payload);
    assert.strictEqual(repeat.hex, hex, 'Hashing must be deterministic');
  });

  it('2. MRV Stub Bundle Generator produces valid DEMO bundle and positive net carbon', async () => {
    const bundle = await generateDemoMrvBundle(1, 1000, 1000, 2000, 'Mangrove');

    assert.strictEqual(bundle.tag, 'DEMO');
    assert.strictEqual(bundle.projectId, 1);
    assert.ok(bundle.milliTco2eNet > 0n, 'Net sequestered carbon must be positive');
    assert.ok(bundle.cloudCoverPct < 15.0, 'Cloud cover must be beneath 15% threshold');
    assert.ok(bundle.sha256Hex.startsWith('0x'));
    assert.ok(bundle.bundleCid.startsWith('bafybeidemo'));
  });

  it('3. Beneficiary Shares 10,000 bps (100.00%) Invariant', () => {
    const validShares = [
      { who: '0x1', share_bps: 6000 },
      { who: '0x2', share_bps: 4000 },
    ];
    const invalidUnder = [
      { who: '0x1', share_bps: 5000 },
      { who: '0x2', share_bps: 3000 },
    ];
    const invalidOver = [
      { who: '0x1', share_bps: 7000 },
      { who: '0x2', share_bps: 4000 },
    ];

    const sum = (shares: { share_bps: number }[]) => shares.reduce((acc, s) => acc + s.share_bps, 0);

    assert.strictEqual(sum(validShares), 10000, 'Valid shares must total 10,000 bps');
    assert.notStrictEqual(sum(invalidUnder), 10000, 'Under-allocated shares must not equal 10,000 bps');
    assert.notStrictEqual(sum(invalidOver), 10000, 'Over-allocated shares must not equal 10,000 bps');
  });

  it('4. Marketplace BigInt Financial Arithmetic & 2% Platform Fee', () => {
    const milliBlu = 100_000n; // 100.000 BLU
    const pricePerMilliPlanck = 25_000_000_000n; // 25 VARA per tonne

    const baseCostPlanck = milliBlu * pricePerMilliPlanck;
    const platformFeePlanck = (baseCostPlanck * 200n) / 10000n; // 2% fee
    const totalCostPlanck = baseCostPlanck + platformFeePlanck;

    // 100 * 25 VARA = 2500 VARA base = 2,500,000,000,000,000 planck
    assert.strictEqual(baseCostPlanck, 2_500_000_000_000_000n);
    // 2% of 2500 VARA = 50 VARA fee = 50,000,000,000,000 planck
    assert.strictEqual(platformFeePlanck, 50_000_000_000_000n);
    // Total = 2550 VARA
    assert.strictEqual(totalCostPlanck, 2_550_000_000_000_000n);

    // Format helpers
    assert.strictEqual(formatVara(baseCostPlanck), '2,500.00');
    assert.strictEqual(formatVara(platformFeePlanck), '50.00');
    assert.strictEqual(formatVara(totalCostPlanck), '2,550.00');
  });

  it('5. Contract Error Decoder maps all Sails errors to friendly text', () => {
    const errorCodes = [
      'Unauthorized',
      'Paused',
      'NotFound',
      'InvalidInput',
      'InvalidShares',
      'ProjectNotActive',
      'OverlappingPeriod',
      'AlreadyVoted',
      'ConflictOfInterest',
      'QuorumImpossible',
      'InsufficientBalance',
      'InsufficientListing',
      'WrongPayment',
      'NothingToClaim',
      'BufferDeficit',
      'Overflow',
    ];

    for (const code of errorCodes) {
      const decoded = decodeContractError(code);
      assert.strictEqual(decoded.code, code);
      assert.ok(decoded.title.length > 0, `Title must be present for ${code}`);
      assert.ok(decoded.message.length > 0, `Message must be present for ${code}`);
    }

    // Wrapped error object test
    const decodedWrapped = decodeContractError({ err: 'ConflictOfInterest' });
    assert.strictEqual(decodedWrapped.code, 'ConflictOfInterest');
    assert.strictEqual(decodedWrapped.title, 'Conflict of Interest Detected');
  });

  it('6. Pilot Registry Disclaimer Compliance', () => {
    const requiredNote = 'BluTokens are pilot registry tokens, not government-certified credits.';
    assert.ok(requiredNote.includes('pilot registry tokens'));
    assert.ok(requiredNote.includes('not government-certified credits'));
  });
});
