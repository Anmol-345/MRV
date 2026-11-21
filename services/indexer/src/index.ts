import dotenv from 'dotenv';
import { createHealthServer } from './health.js';
import { Indexer } from './indexer.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const VARA_WS_ENDPOINT = process.env.VARA_WS_ENDPOINT || 'wss://testnet.vara.network';
const START_BLOCK = process.env.START_BLOCK ? BigInt(process.env.START_BLOCK) : 0n;
const PROGRAM_ID = process.env.BLUTOKEN_PROGRAM_ID;

async function start() {
  console.log(`[BluToken Indexer] Starting with endpoint: ${VARA_WS_ENDPOINT}`);
  console.log(`[BluToken Indexer] Configured start block: ${START_BLOCK}`);

  const indexer = new Indexer(VARA_WS_ENDPOINT, PROGRAM_ID, START_BLOCK);

  // Start health server
  const healthApp = createHealthServer(() => indexer.getLag());
  healthApp.listen(PORT, () => {
    console.log(`[BluToken Indexer] Health server listening on port ${PORT}`);
  });

  // Start indexing
  await indexer.start();
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('[BluToken Indexer] Fatal error during startup:', err);
    process.exit(1);
  });
}
