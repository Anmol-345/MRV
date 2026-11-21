# BluToken Mainnet Production Runbook

## 1. Pre-Deployment Readiness Checklist (Hard Gates)
Before deploying BluToken smart programs to Vara Network Mainnet, verify every hard gate:
- [ ] **External Security Audit**: Third-party smart contract audit completed with all critical/high findings resolved.
- [ ] **Scientific Methodology Sign-Off**: National Centre for Coastal Research (NCCR) or MoEFCC expert approval of `carbon_params.yaml` ecological coefficients.
- [ ] **Zero Secrets in Repository**: Full git history scan using `gitleaks` or automated CI regex scan.
- [ ] **Deterministic WASM Verification**: Compile release WASM in isolated Docker container and verify sha256 checksum matches audit artifact.
- [ ] **Multisig Governance Ready**: Admin keys controlled by multi-signature account (e.g. 3-of-5 across Registry Developer, Scientific Verifiers, and Community Representatives).

---

## 2. On-Chain Deployment Procedure

### Step 1: WASM Compilation & Optimization
```bash
# Build optimized program binary in contracts workspace
pnpm --filter @blutoken/contracts run build:wasm

# Check optimized binary sha256 checksum
sha256sum contracts/target/wasm32-unknown-unknown/release/blutoken_app.opt.wasm
```

### Step 2: Mainnet Program Upload & Initialization
Configure environment variables in secure vault:
```bash
export VARA_RPC_URL="wss://rpc.vara.network"
export DEPLOYER_SEED="<vault-stored-mainnet-deployer-seed>"
export TREASURY_ADDRESS="<multisig-treasury-account-id>"
```

Deploy program via deployment script:
```bash
pnpm contracts:deploy --network mainnet
```

Program initialization parameters:
- `quorum`: `3` (requires 3 independent verifier approvals)
- `min_orgs`: `3` (from at least 3 distinct accredited scientific bodies)
- `buffer_bps`: `2000` (20.00% permanence buffer reserve)
- `platform_fee_bps`: `200` (2.00% protocol maintenance fee)
- `treasury`: Multisig treasury address
- `paused`: `false`

### Step 3: Role Delegation & Timelock Transfer
1. Grant initial accredited verifier roles:
   - Verifier 1 (NCCR / NIOT) &rarr; Org ID 1
   - Verifier 2 (ICAR-CIBA / MSSRF) &rarr; Org ID 2
   - Verifier 3 (WII / SAC-ISRO) &rarr; Org ID 3
2. Transfer `Admin` role to the Governance Multisig:
   ```bash
   pnpm contracts:grant-role --role Admin --target <multisig-address>
   pnpm contracts:revoke-role --role Admin --target <deployer-address>
   ```

---

## 3. Off-Chain Infrastructure Deployment

### Services Architecture (GCP / Kubernetes)
- **Web App & REST API (`apps/web`)**: Deployed to Google Cloud Run (min instances: 2, autoscaling to 20).
- **Read Database (`packages/database`)**: Cloud SQL for PostgreSQL (Postgres 16, High Availability Multi-Zone, daily automated snapshots).
- **Indexer Worker (`services/indexer`)**: Dedicated Kubernetes StatefulSet with leader election (single-writer lease) maintaining finalized block synchronization.
- **MRV Worker (`services/mrv-worker`)**: Cloud Run worker with private VPC connector to Earth Engine and IPFS pinning service.

---

## 4. Emergency Incident Response Runbook

### Incident A: Suspected Smart Contract Vulnerability
1. **Trigger Emergency Circuit Breaker**:
   ```bash
   # Multisig executes emergency pause
   pnpm contracts:pause
   ```
2. **Impact**: Submissions, votes, transfers, and listings freeze immediately.
3. **Community Protection**: Accumulated revenue in `claimable` mappings remains mathematically unspendable by unauthorized parties and can be pulled once unpaused or migrated.
4. **Investigation**: Assess invariants and execute fix via new program migration.

### Incident B: Physical Carbon Reversal (Cyclone / Tree Die-off)
1. Flag reversal via `Registry.flag_reversal(project_id, amount, evidence_cid)`:
   - Burns compensating credits from the project's held buffer pool.
   - If project buffer is insufficient, burns from the global protocol buffer pool.
2. Invariant: Supply of active credits in circulation never exceeds verified biomass on the ground.

### Incident C: Indexer Database Desynchronization
1. Stop indexer worker.
2. Run database state rebuild:
   ```bash
   pnpm --filter @blutoken/indexer rebuild
   ```
3. The indexer replays all finalized chain events in sequential order and restores exact projection tables within minutes.
