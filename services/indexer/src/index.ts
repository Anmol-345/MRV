import dotenv from 'dotenv';
import { prisma } from '@blutoken/database';
import { createHealthServer } from './health.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const VARA_WS_ENDPOINT = process.env.VARA_WS_ENDPOINT || 'wss://testnet.vara.network';
const START_BLOCK = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK, 10) : 0;

let currentBlockLag = 0;

async function start() {
  console.log(`[BluToken Indexer] Starting with endpoint: ${VARA_WS_ENDPOINT}`);
  console.log(`[BluToken Indexer] Configured start block: ${START_BLOCK}`);

  // Start health server
  const healthApp = createHealthServer(() => currentBlockLag);
  healthApp.listen(PORT, () => {
    console.log(`[BluToken Indexer] Health server listening on port ${PORT}`);
  });

  // Check database connectivity
  try {
    const syncState = await prisma.syncState.findUnique({
      where: { key: 'last_processed_block' },
    });
    console.log(`[BluToken Indexer] Last synced block from DB: ${syncState?.value ?? 'None'}`);
  } catch (err) {
    console.warn(`[BluToken Indexer] Database not yet migrated or unreachable:`, err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('[BluToken Indexer] Fatal error during startup:', err);
    process.exit(1);
  });
}
