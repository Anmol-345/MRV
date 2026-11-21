import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const idlPath = path.resolve(rootDir, '../../contracts/client/blutoken.idl');
const outDir = path.resolve(rootDir, 'src/generated');
const libPath = path.resolve(outDir, 'lib.ts');

// 1. Run sails-js generate
console.log('Generating TS client from IDL...');
execSync(`npx sails-js generate "${idlPath}" --no-project --embed-types -n BluToken -o "${outDir}" -y`, {
  stdio: 'inherit',
  cwd: rootDir,
});

// 2. Post-process lib.ts to fix sails-js generator edge cases
let content = fs.readFileSync(libPath, 'utf8');

// Fix HexString import from @gear-js/api
content = content.replace(
  "import { GearApi, BaseGearProgram, HexString } from '@gear-js/api';",
  "import { GearApi, BaseGearProgram } from '@gear-js/api';\nexport type HexString = `0x${string}`;"
);

// Fix property collision between TypeRegistry and Registry service
content = content.replace(
  'public readonly registry: TypeRegistry;',
  'public readonly typeRegistry: TypeRegistry;'
);

content = content.replace(
  'this.registry = new TypeRegistry();\n    this.registry.setKnownTypes({ types });\n    this.registry.register(types);',
  'this.typeRegistry = new TypeRegistry();\n    this.typeRegistry.setKnownTypes({ types });\n    this.typeRegistry.register(types);'
);

// All service methods pass the Polkadot TypeRegistry from _program
content = content.replaceAll('this._program.registry', 'this._program.typeRegistry');

// Also in constructor of BluToken for constructors TransactionBuilder:
content = content.replaceAll('this.registry,', 'this.typeRegistry,');

// Fix implicit any in event callbacks: ({ data: { message } }) => -> ({ data: { message } }: any) =>
content = content.replaceAll('({ data: { message } }) =>', '({ data: { message } }: any) =>');

fs.writeFileSync(libPath, content, 'utf8');
console.log('Successfully generated and patched TS client at', libPath);
