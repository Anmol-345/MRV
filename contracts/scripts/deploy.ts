import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { BluToken, type Params } from '@blutoken/chain-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface DeploymentResult {
  programId: `0x${string}`;
  codeId?: `0x${string}`;
  network: string;
  rpcUrl: string;
  deployerAddress: string;
  deployerActorId: `0x${string}`;
  timestamp: string;
  params: Params;
}

function findWasmBinary(): { path: string; data: Buffer } {
  const possiblePaths = [
    process.env.WASM_PATH,
    path.resolve(__dirname, '../target/wasm32-unknown-unknown/release/blutoken_app.opt.wasm'),
    path.resolve(__dirname, '../target/wasm32-unknown-unknown/release/blutoken_app.wasm'),
    path.resolve(__dirname, '../target/wasm32-unknown-unknown/debug/blutoken_app.opt.wasm'),
    path.resolve(__dirname, '../target/wasm32-unknown-unknown/debug/blutoken_app.wasm'),
  ].filter((p): p is string => Boolean(p) && fs.existsSync(p));

  if (possiblePaths.length === 0) {
    throw new Error(
      'WASM binary not found! Please build first with: pnpm --filter @blutoken/contracts run build:wasm or cargo build --release'
    );
  }

  const selectedPath = possiblePaths[0];
  const data = fs.readFileSync(selectedPath);
  return { path: selectedPath, data };
}

export async function deploy(): Promise<DeploymentResult> {
  console.log('='.repeat(60));
  console.log('BluToken Contract Deployment (Vara Network)');
  console.log('='.repeat(60));

  await cryptoWaitReady();

  const { path: wasmPath, data: wasmBinary } = findWasmBinary();
  console.log(`Using WASM: ${wasmPath} (${(wasmBinary.length / 1024).toFixed(1)} KB)`);

  const isMainnet =
    process.argv.includes('--mainnet') ||
    process.argv.includes('mainnet') ||
    process.env.NETWORK === 'mainnet';
  const defaultRpc = isMainnet ? 'wss://rpc.vara.network' : 'wss://testnet.vara.network';
  const rpcUrl = process.env.VARA_MAINNET_RPC || process.env.VARA_RPC_URL || defaultRpc;
  console.log(`Target Network: ${isMainnet ? 'Vara Mainnet' : 'Vara Testnet'}`);
  console.log(`Target RPC: ${rpcUrl}`);

  const keyring = new Keyring({ type: 'sr25519', ss58Format: 137 });
  const deployerSeed = process.env.DEPLOYER_SEED || process.env.DEPLOYER_MNEMONIC;
  const deployer = deployerSeed
    ? deployerSeed.startsWith('//')
      ? keyring.addFromUri(deployerSeed)
      : keyring.addFromMnemonic(deployerSeed)
    : keyring.addFromUri('//Alice');

  const deployerActorId = u8aToHex(deployer.addressRaw) as `0x${string}`;
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer ActorId: ${deployerActorId}`);
  if (!deployerSeed) {
    console.log('[Notice] Using default development keyring //Alice. For testnet/mainnet, set DEPLOYER_SEED/MNEMONIC.');
  }

  const treasuryActorId = process.env.TREASURY_ADDRESS
    ? (u8aToHex(decodeAddress(process.env.TREASURY_ADDRESS)) as `0x${string}`)
    : deployerActorId;

  const initialParams: Params = {
    quorum: Number(process.env.QUORUM || 2),
    min_orgs: Number(process.env.MIN_ORGS || 2),
    buffer_bps: Number(process.env.BUFFER_BPS || 2000), // 20%
    platform_fee_bps: Number(process.env.PLATFORM_FEE_BPS || 250), // 2.5%
    treasury: treasuryActorId,
    paused: false,
  };

  let api: GearApi | null = null;
  let isConnected = false;

  try {
    console.log(`Connecting to GearApi at ${rpcUrl}...`);
    // Connect with a 30s timeout
    const connectPromise = GearApi.create({ providerAddress: rpcUrl });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out after 30s')), 30000)
    );
    api = await Promise.race([connectPromise, timeoutPromise]);
    isConnected = true;
    console.log(`Connected to chain: ${await api.chain()} (genesis: ${api.genesisHash.toHex().slice(0, 10)}...)`);
  } catch (err: any) {
    console.warn(`[Warning] Could not connect to RPC endpoint: ${err.message}`);
    if (isMainnet) {
      throw new Error(`Failed to connect to Vara Mainnet RPC at ${rpcUrl}. Aborting.`);
    }
  }

  let programId: `0x${string}`;

  if (isConnected && api) {
    try {
      const blutoken = new BluToken(api);
      console.log('Initiating upload_program transaction...');
      const ctor = blutoken.newCtorFromCode(wasmBinary);
      await ctor.withAccount(deployer).calculateGas();
      console.log(`Calculated gas: ${ctor.gasInfo?.min_limit?.toString() || 'default'}`);

      const { msgId, txHash, isFinalized } = await ctor.signAndSend();
      console.log(`Upload transaction sent! txHash=${txHash}, msgId=${msgId}`);
      console.log('Waiting for block finalization...');
      await isFinalized;

      programId = blutoken.programId;
      console.log(`\n============================================================`);
      console.log(`>>> PROGRAM DEPLOYED ON-CHAIN AT: ${programId} <<<`);
      console.log(`============================================================\n`);

      // Initialize parameters
      console.log('Setting initial platform parameters...');
      const paramsTx = blutoken.admin.setParams(initialParams);
      await paramsTx.withAccount(deployer).calculateGas();
      const paramsResult = await paramsTx.signAndSend();
      console.log(`setParams transaction sent! txHash=${paramsResult.txHash}`);
      await paramsResult.isFinalized;
      const paramsResponse = await paramsResult.response();
      console.log('Parameters configured successfully:', paramsResponse);

      if (!isMainnet) {
        // Grant initial verifier roles to Bob and Charlie (testnet dev orgs)
        const bob = keyring.addFromUri('//Bob');
        const charlie = keyring.addFromUri('//Charlie');
        console.log('Granting pilot verifier roles (Org 1: Bob, Org 2: Charlie)...');

        const bobRoleTx = blutoken.admin.grantRole(u8aToHex(bob.addressRaw) as `0x${string}`, 'Verifier', 1);
        await bobRoleTx.withAccount(deployer).calculateGas();
        const bobRes = await bobRoleTx.signAndSend();
        await bobRes.isFinalized;

        const charlieRoleTx = blutoken.admin.grantRole(u8aToHex(charlie.addressRaw) as `0x${string}`, 'Verifier', 2);
        await charlieRoleTx.withAccount(deployer).calculateGas();
        const charlieRes = await charlieRoleTx.signAndSend();
        await charlieRes.isFinalized;
        console.log('Pilot verifier roles granted.');
      } else {
        console.log('[Mainnet] Deployer holds Admin role. Production verifiers can be granted on-chain as needed.');
      }
    } finally {
      await api.disconnect();
    }
  } else {
    // Generate deterministic mock program ID when offline / dry-run
    console.log('[Offline/Mock Mode] Generating deterministic program ID based on WASM hash & deployer...');
    const crypto = await import('node:crypto');
    const wasmHash = crypto.createHash('sha256').update(wasmBinary).digest('hex');
    const deployerPrefix = deployerActorId.slice(2, 18);
    programId = `0x${deployerPrefix}${wasmHash.slice(0, 48)}` as `0x${string}`;
    console.log(`Deterministic Program ID: ${programId}`);
  }

  const result: DeploymentResult = {
    programId,
    network: isConnected ? (isMainnet ? 'mainnet' : 'testnet') : 'mock-local',
    rpcUrl,
    deployerAddress: deployer.address,
    deployerActorId,
    timestamp: new Date().toISOString(),
    params: initialParams,
  };

  // Save deployment record
  const deployedPath = path.resolve(__dirname, '../deployed.json');
  fs.writeFileSync(deployedPath, JSON.stringify(result, null, 2));
  console.log(`Deployment recorded at: ${deployedPath}`);

  // Update .env.example / .env.local hint
  console.log('\nTo configure apps/web with this program:');
  console.log(`Add to .env.local: NEXT_PUBLIC_PROGRAM_ID=${programId}`);
  console.log(`Add to .env.local: NEXT_PUBLIC_VARA_RPC_URL=${rpcUrl}`);
  console.log(`Explorer Link: https://idea.gear-tech.io/programs/${programId}?node=${encodeURIComponent(rpcUrl)}`);
  console.log('='.repeat(60));

  return result;
}

// Execute when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  deploy()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Deployment failed:', err);
      process.exit(1);
    });
}
