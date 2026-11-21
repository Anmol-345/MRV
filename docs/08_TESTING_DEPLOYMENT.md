# 08 – Testing, Deployment & Security

## 1. Test pyramid
| Layer | Tool | What |
|---|---|---|
| Contract unit/integration | `cargo test` + sails-rs gtest | all rules, errors, invariants, rounding |
| Contract property tests | proptest (or equivalent) | supply, retirement, share-split invariants |
| Client generation | CI step | regenerate TS client from IDL; fail if diff uncommitted |
| Indexer | Vitest + recorded events | idempotency, rebuild equality, reconnect |
| API | Vitest + supertest | auth, validation, pagination, rate limits |
| MRV worker | pytest | carbon math (golden cases), refuse-on-TODO, canonical hashing |
| Web components | Vitest + Testing Library | amount formatting (BigInt), forms, error mapping |
| E2E | Playwright | mocked wallet flows; 1 slow testnet run nightly |

## 2. CI (GitHub Actions)
Jobs: `contracts` (fmt, clippy, build wasm, test, regen IDL/client check) · `web` (lint, typecheck, test, build) · `indexer` · `worker` · `e2e` (on main). Cache Cargo and pnpm.

## 3. Deployment
**Contracts**
1. Build release WASM:
   ```bash
   pnpm --filter @blutoken/contracts run build:wasm
   # Outputs optimized WASM at contracts/target/wasm32-unknown-unknown/release/blutoken_app.opt.wasm
   ```
2. Deploy program to **testnet**:
   ```bash
   pnpm contracts:deploy
   ```
   - Connects to `VARA_RPC_URL` (default: `wss://testnet.vara.network`).
   - Uses `DEPLOYER_SEED` / `DEPLOYER_MNEMONIC` (falls back to dev `//Alice`).
   - Uploads WASM, initializes `BluTokenProgram`, configures `Params` (quorum: 2, min_orgs: 2, buffer: 20%, fee: 2.5%), and grants pilot verifier roles (`//Bob` Org 1, `//Charlie` Org 2).
   - Writes `contracts/deployed.json` and outputs program ID.

3. Run end-to-end CLI smoke test:
   ```bash
   pnpm contracts:smoke
   ```
   Executes the full 7-step lifecycle:
   - Step 1: `register_project` (Project owner registers project)
   - Step 2: `activate_project` (Admin activates project)
   - Step 3: `submit_report` (Project owner submits MRV report)
   - Step 4: `vote_report` (2 verifiers from 2 distinct organizations vote approve -> verifies report & mints BLU with 20% buffer conservation)
   - Step 5: `create_listing` (Project owner lists BLU credits on market)
   - Step 6: `buy_and_retire` (Buyer purchases credits and retires with beneficiary certificate)
   - Step 7: `claim_revenue` (Beneficiaries claim pull-payment revenue shares)

4. Mainnet only after external audit and an NCCR/MoEFCC sign-off on methodology.
Remember: programs are immutable; plan migration, keep a `version()` query.

**Off-chain**
- Containerise web, indexer, worker. Deploy on GCP (Cloud Run for web/API/worker; Postgres on Cloud SQL; Kubernetes optional per deck).
- Run migrations in CI/CD; blue-green for web; indexer single-writer with leader lock.
- Backups: daily Postgres snapshot (DB is rebuildable from chain but IPFS CIDs/offchain tables are not).

## 4. Security checklist
Contracts
- [ ] Checked arithmetic everywhere; no panics on user input
- [ ] Mint/burn unreachable externally
- [ ] State updated before native transfers (claims, refunds)
- [ ] Payment amounts validated exactly
- [ ] Role gating on every admin/verifier path; conflict-of-interest tested
- [ ] Pause works and cannot lock user revenue
- [ ] Existential deposit / program balance accounting tested
- [ ] External audit completed (mainnet gate)

Off-chain
- [ ] Zod on every input; size/type limits on uploads
- [ ] Nonce-based wallet auth, httpOnly+SameSite cookies, CSRF protection
- [ ] Rate limits on public POST routes
- [ ] Secrets in secret manager; service-account scoped to Earth Engine only
- [ ] Sensor signatures + replay protection
- [ ] CSP, HSTS, dependency audit (`pnpm audit`, `cargo audit`), secrets scan in CI
- [ ] PII minimisation and deletion path

Product integrity
- [ ] "Pilot registry token, not government-certified" notice on market, certificate, landing
- [ ] Methodology version visible on every report and certificate
- [ ] No carbon coefficient without a cited source

## 5. Observability
Structured JSON logs; metrics for indexer lag, API latency, job duration/failures, tx failure rate; alerts on indexer lag > N blocks, worker failure spikes, sensor-offline clusters.

## 6. Pilot rollout (from the deck: "start small")
1. One coastal zone, one NGO + NCCR partner, 1–3 projects on testnet.
2. Dry-run a full report → mint → retire cycle with real satellite data and expert-reviewed parameters.
3. Community awareness sessions + local-language onboarding.
4. Review with policymakers; iterate regulation-facing features.
5. Only then consider mainnet and more regions / ecosystems (wetlands, coral reefs).
