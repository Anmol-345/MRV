import dotenv from 'dotenv';
import { Indexer } from './indexer.js';

dotenv.config();

const VARA_WS_ENDPOINT = process.env.VARA_WS_ENDPOINT || 'wss://testnet.vara.network';
const PROGRAM_ID = process.env.BLUTOKEN_PROGRAM_ID;

async function main() {
  console.log('[rebuild] Starting indexer rebuild...');
  const indexer = new Indexer(VARA_WS_ENDPOINT, PROGRAM_ID);
  try {
    const count = await indexer.rebuild();
    console.log(`[rebuild] Successfully replayed ${count} events.`);
    process.exit(0);
  } catch (err) {
    console.error('[rebuild] Error rebuilding projection:', err);
    process.exit(1);
  }
}

main();
