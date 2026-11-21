import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '@blutoken/database';
import { Indexer } from '../src/indexer.js';
import { ChainEventRecord } from '../src/types.js';

describe('Indexer & Database Integration Test', () => {
  const indexer = new Indexer('wss://testnet.vara.network');

  const rawEvents = JSON.parse(
    fs.readFileSync(new URL('./fixtures/smoke_events.json', import.meta.url), 'utf-8')
  );

  const events: ChainEventRecord[] = rawEvents.map((e: any) => ({
    blockNumber: BigInt(e.blockNumber),
    eventIndex: e.eventIndex,
    service: e.service,
    name: e.name,
    payload: e.payload,
    txHash: e.txHash,
    ts: new Date(e.ts),
  }));

  before(async () => {
    // Clean all tables before running tests
    await prisma.vote.deleteMany();
    await prisma.mrvReport.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.retirement.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.beneficiary.deleteMany();
    await prisma.revenueClaim.deleteMany();
    await prisma.citizenReport.deleteMany();
    await prisma.satelliteObservation.deleteMany();
    await prisma.sensorReading.deleteMany();
    await prisma.sensorDevice.deleteMany();
    await prisma.project.deleteMany();
    await prisma.balance.deleteMany();
    await prisma.syncState.deleteMany();
    await prisma.chainEvent.deleteMany();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it('1. Processes all smoke events in sequential order and updates projection', async () => {
    const processed = await indexer.processEvents(events);
    assert.strictEqual(processed, 9, 'All 9 events should be newly processed');

    // 1. Check raw chain_events
    const eventCount = await prisma.chainEvent.count();
    assert.strictEqual(eventCount, 9, 'Should have stored 9 raw chain events');

    // 2. Check Project
    const project = await prisma.project.findUnique({
      where: { id: 1n },
      include: { beneficiaries: true },
    });
    assert.ok(project, 'Project 1 must exist');
    assert.strictEqual(project.name, 'Sundarbans Mangrove Conservation Pilot');
    assert.strictEqual(project.ecosystem, 'Mangrove');
    assert.strictEqual(project.stateCode, 'WB');
    assert.strictEqual(Number(project.areaHa), 1000);
    assert.strictEqual(project.status, 'Active', 'Project must be activated');
    assert.strictEqual(project.totalMinted, 4000000n, 'Total minted should be 4,000,000 milli');
    assert.strictEqual(project.totalRetired, 200000n, 'Total retired should be 200,000 milli');
    assert.strictEqual(project.bufferHeld, 1000000n, 'Buffer held should be 1,000,000 milli');

    // 3. Check Beneficiaries
    assert.strictEqual(project.beneficiaries.length, 2, 'Should have 2 beneficiaries');
    const aliceBen = project.beneficiaries.find((b) => b.shareBps === 7000);
    assert.ok(aliceBen, 'Alice beneficiary (70%) should exist');

    // 4. Check MRV Report
    const report = await prisma.mrvReport.findUnique({
      where: { id: 1n },
      include: { votes: true },
    });
    assert.ok(report, 'Report 1 must exist');
    assert.strictEqual(report.status, 'Verified');
    assert.strictEqual(report.minted, 4000000n);
    assert.strictEqual(report.buffered, 1000000n);
    assert.strictEqual(report.votes.length, 1);
    assert.strictEqual(report.votes[0].approve, true);

    // 5. Check Listing & Trades
    const listing = await prisma.listing.findUnique({
      where: { id: 1n },
      include: { trades: true },
    });
    assert.ok(listing, 'Listing 1 must exist');
    assert.strictEqual(listing.remaining, 500000n, 'Remaining should be 500,000 milli');
    assert.strictEqual(listing.pricePerMilli, 50n);
    assert.strictEqual(listing.trades.length, 1);
    assert.strictEqual(listing.trades[0].amount, 500000n);
    assert.strictEqual(listing.trades[0].value, 25000000n);

    // 6. Check Retirement
    const retirement = await prisma.retirement.findUnique({
      where: { id: 1n },
    });
    assert.ok(retirement, 'Retirement 1 must exist');
    assert.strictEqual(retirement.amount, 200000n);
    assert.strictEqual(retirement.beneficiaryName, 'Acme Corp ESG Neutrality 2026');
    assert.strictEqual(retirement.reason, 'Scope 3 Offset');

    // 7. Check Revenue Claim
    const claims = await prisma.revenueClaim.findMany();
    assert.strictEqual(claims.length, 1);
    assert.strictEqual(claims[0].amount, 17500000n);

    // 8. Check Balances
    const charlieBalance = await prisma.balance.findUnique({
      where: { wallet: '0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22' },
    });
    assert.ok(charlieBalance, 'Charlie balance must exist');
    assert.strictEqual(
      charlieBalance.balanceMilli,
      300000n,
      'Charlie should hold 300,000 milli (500k bought - 200k retired)'
    );

    // 9. Check SyncState
    const lastBlock = await prisma.syncState.findUnique({
      where: { key: 'last_processed_block' },
    });
    assert.ok(lastBlock);
    assert.strictEqual(lastBlock.value, '108');
  });

  it('2. Idempotency check: Re-processing identical events causes 0 mutations and no duplicates', async () => {
    const reprocessed = await indexer.processEvents(events);
    assert.strictEqual(reprocessed, 0, 'Reprocessing identical events should result in 0 new events');

    const totalEvents = await prisma.chainEvent.count();
    assert.strictEqual(totalEvents, 9, 'ChainEvent count must stay exactly 9');

    const totalProjects = await prisma.project.count();
    assert.strictEqual(totalProjects, 1, 'Project count must stay 1');

    const project = await prisma.project.findUnique({ where: { id: 1n } });
    assert.strictEqual(project?.totalMinted, 4000000n, 'Total minted must not change');
  });

  it('3. Rebuild check: indexer.rebuild() replays events and reproduces identical state', async () => {
    const replayed = await indexer.rebuild();
    assert.strictEqual(replayed, 9, 'Rebuild should replay all 9 chain events');

    // Re-verify read models after rebuild
    const project = await prisma.project.findUnique({
      where: { id: 1n },
      include: { beneficiaries: true },
    });
    assert.ok(project);
    assert.strictEqual(project.totalMinted, 4000000n);
    assert.strictEqual(project.totalRetired, 200000n);
    assert.strictEqual(project.bufferHeld, 1000000n);
    assert.strictEqual(project.beneficiaries.length, 2);

    const charlieBalance = await prisma.balance.findUnique({
      where: { wallet: '0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22' },
    });
    assert.strictEqual(charlieBalance?.balanceMilli, 300000n);

    const retirement = await prisma.retirement.findUnique({ where: { id: 1n } });
    assert.ok(retirement);
    assert.strictEqual(retirement.amount, 200000n);
  });
});
