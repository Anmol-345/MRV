import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GearApi } from '@gear-js/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function checkBalance() {
  const address = process.argv[2] || 'kGkS4G9FQXc8JYsYJSL21SszTVoKzmU5WqFoqDATWRbLN5Wp8';
  const rpcUrl = process.env.VARA_MAINNET_RPC || 'wss://rpc.vara.network';

  console.log(`Checking balance for: ${address}`);
  console.log(`Connecting to Vara Mainnet: ${rpcUrl}...`);

  try {
    const api = await GearApi.create({ providerAddress: rpcUrl });
    const { data: balance } = await api.query.system.account(address);
    const freePlanck = BigInt(balance.free.toString());
    const freeVara = Number(freePlanck / 1_000_000_000n) / 1000;

    console.log(`Free Balance: ${freeVara.toFixed(3)} VARA (${freePlanck.toString()} planck)`);
    await api.disconnect();
    return { freeVara, freePlanck };
  } catch (err: any) {
    console.error('Failed to query balance:', err.message);
    return null;
  }
}

checkBalance();
