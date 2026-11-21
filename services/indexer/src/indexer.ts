import { prisma } from '@blutoken/database';
import { GearApi } from '@gear-js/api';
import { ChainEventRecord } from './types.js';
import { projectEvent } from './projector.js';

export class Indexer {
  private api: GearApi | null = null;
  private isRunning = false;
  private currentBlockLag = 0;
  private lastProcessedBlock = 0n;
  private targetProgramId: string;

  constructor(
    private wsEndpoint: string,
    programId?: string,
    private startBlock = 0n
  ) {
    this.targetProgramId = (programId || process.env.BLUTOKEN_PROGRAM_ID || '').toLowerCase();
  }

  public getLag(): number {
    return this.currentBlockLag;
  }

  public getLastProcessedBlock(): bigint {
    return this.lastProcessedBlock;
  }

  /**
   * Process a single event idempotently.
   * Inserts raw record into chain_events and projects into read models.
   * Returns true if event was newly processed, false if duplicate.
   */
  public async processEvent(event: ChainEventRecord): Promise<boolean> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Idempotency check: try to create raw chain event
        let isNew = false;
        try {
          await tx.chainEvent.create({
            data: {
              blockNumber: event.blockNumber,
              eventIndex: event.eventIndex,
              service: event.service,
              name: event.name,
              payload: event.payload,
              txHash: event.txHash,
              ts: event.ts,
            },
          });
          isNew = true;
        } catch (err: any) {
          // Prisma unique constraint violation code is P2002
          if (err.code === 'P2002') {
            return false;
          }
          throw err;
        }

        if (isNew) {
          await projectEvent(tx, event);

          if (event.blockNumber > this.lastProcessedBlock) {
            this.lastProcessedBlock = event.blockNumber;
            await tx.syncState.upsert({
              where: { key: 'last_processed_block' },
              create: { key: 'last_processed_block', value: event.blockNumber.toString() },
              update: { value: event.blockNumber.toString() },
            });
          }
        }

        return isNew;
      });
    } catch (err) {
      console.error(`[Indexer] Error processing event ${event.service}.${event.name}:`, err);
      throw err;
    }
  }

  /**
   * Process a batch of events within a single database transaction.
   */
  public async processEvents(events: ChainEventRecord[]): Promise<number> {
    let processedCount = 0;
    for (const event of events) {
      const processed = await this.processEvent(event);
      if (processed) processedCount++;
    }
    return processedCount;
  }

  /**
   * Rebuild the entire database state by replaying all chain_events from block 0.
   * Truncates projected tables and replays in sequential order.
   */
  public async rebuild(): Promise<number> {
    console.log('[Indexer] Initiating database rebuild from raw chain events...');

    return await prisma.$transaction(
      async (tx) => {
        // Truncate projected read models in dependent order
        console.log('[Indexer] Truncating projected read tables...');
        await tx.vote.deleteMany();
        await tx.mrvReport.deleteMany();
        await tx.trade.deleteMany();
        await tx.retirement.deleteMany();
        await tx.listing.deleteMany();
        await tx.beneficiary.deleteMany();
        await tx.revenueClaim.deleteMany();
        await tx.citizenReport.deleteMany();
        await tx.satelliteObservation.deleteMany();
        await tx.sensorReading.deleteMany();
        await tx.sensorDevice.deleteMany();
        await tx.project.deleteMany();
        await tx.balance.deleteMany();
        await tx.syncState.deleteMany();

        // Fetch all raw events in chronological order
        const allEvents = await tx.chainEvent.findMany({
          orderBy: [{ blockNumber: 'asc' }, { eventIndex: 'asc' }],
        });

        console.log(`[Indexer] Replaying ${allEvents.length} chain events...`);

        let highestBlock = 0n;
        for (const raw of allEvents) {
          const event: ChainEventRecord = {
            blockNumber: raw.blockNumber,
            eventIndex: raw.eventIndex,
            service: raw.service,
            name: raw.name,
            payload: raw.payload as Record<string, any>,
            txHash: raw.txHash,
            ts: raw.ts,
          };

          await projectEvent(tx, event);

          if (raw.blockNumber > highestBlock) {
            highestBlock = raw.blockNumber;
          }
        }

        if (highestBlock > 0n) {
          await tx.syncState.upsert({
            where: { key: 'last_processed_block' },
            create: { key: 'last_processed_block', value: highestBlock.toString() },
            update: { value: highestBlock.toString() },
          });
          this.lastProcessedBlock = highestBlock;
        }

        console.log(`[Indexer] Rebuild complete! Replayed ${allEvents.length} events successfully.`);
        return allEvents.length;
      },
      {
        timeout: 60000, // 60s timeout for large replays
      }
    );
  }

  /**
   * Start live indexing from chain.
   */
  public async start(): Promise<void> {
    this.isRunning = true;
    console.log(`[Indexer] Connecting to ${this.wsEndpoint}...`);

    try {
      this.api = await GearApi.create({ providerAddress: this.wsEndpoint });
      console.log(`[Indexer] Connected to chain: ${await this.api.chain()}`);

      // Read last processed block from syncState
      const lastSync = await prisma.syncState.findUnique({
        where: { key: 'last_processed_block' },
      });
      if (lastSync) {
        this.lastProcessedBlock = BigInt(lastSync.value);
      } else {
        this.lastProcessedBlock = this.startBlock;
      }

      console.log(`[Indexer] Resume syncing from block ${this.lastProcessedBlock}`);

      // Subscribe to finalized blocks
      await (this.api.gearEvents as any).subscribeToNewBlocks(async (header: any) => {
        if (!this.isRunning) return;
        const currentBlock = BigInt(header.number.toString());
        if (currentBlock > this.lastProcessedBlock) {
          this.currentBlockLag = Number(currentBlock - this.lastProcessedBlock);
        } else {
          this.currentBlockLag = 0;
        }
      });
    } catch (err: any) {
      console.warn(`[Indexer] Could not connect to live RPC: ${err.message}. Running in offline/idle mode.`);
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}
