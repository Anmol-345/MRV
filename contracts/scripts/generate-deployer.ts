import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envLocalPath = path.resolve(__dirname, '../../.env.local');

// Load existing env if present
dotenv.config({ path: envLocalPath });

async function main() {
  await cryptoWaitReady();

  let mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.DEPLOYER_SEED;
  let isNew = false;

  if (!mnemonic || mnemonic.startsWith('//')) {
    mnemonic = mnemonicGenerate(12);
    isNew = true;

    // Append to .env.local safely
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf-8');
    }

    if (!envContent.includes('DEPLOYER_MNEMONIC=')) {
      envContent += `\n# Dedicated Mainnet Deployer Account (DO NOT COMMIT)\nDEPLOYER_MNEMONIC="${mnemonic}"\n`;
      fs.writeFileSync(envLocalPath, envContent, 'utf-8');
    }
  }

  // Derive addresses
  // Prefix 137 = Vara Network native SS58 format (starts with kG/kH)
  const varaKeyring = new Keyring({ type: 'sr25519', ss58Format: 137 });
  const varaPair = mnemonic.startsWith('//')
    ? varaKeyring.addFromUri(mnemonic)
    : varaKeyring.addFromMnemonic(mnemonic);

  // Prefix 42 = Generic Substrate format (starts with 5...)
  const substrateKeyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
  const substratePair = mnemonic.startsWith('//')
    ? substrateKeyring.addFromUri(mnemonic)
    : substrateKeyring.addFromMnemonic(mnemonic);

  const actorId = u8aToHex(varaPair.addressRaw);

  const output = {
    isNew,
    varaAddress: varaPair.address,
    substrateAddress: substratePair.address,
    actorId,
    mnemonicSavedIn: envLocalPath,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
