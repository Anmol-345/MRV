# 02 – Architecture

## 1. Layers (deck's layers, mapped to the Vara stack)
```
Stakeholders   Communities · NGOs · NCCR · MoEFCC · Industries
Applications   Next.js web app (PWA): citizen reporting, project/marketplace UI, gov dashboard
Off-chain      Next.js route handlers (REST) · Postgres · Indexer worker · MRV worker (Python) · IPFS pinning
Intelligence   Google Earth Engine · TensorFlow · OpenCV  (inside MRV worker)
Ledger         Vara Network: single Sails program with services Registry, Bluvft, Market, Admin
Data sources   Bhuvan · Sentinel-2 · Landsat · Drones · IoT sensors · Field data
```

## 2. Trust boundaries
- **On-chain is truth for:** roles, projects (ids/owners/splits), report status & votes, BLU balances, listings, retirements, revenue accruals.
- **Off-chain is truth for:** raw imagery, sensor series, AI outputs, citizen photos (all content-addressed; hash anchored on-chain).
- The DB is a **cache + index** of chain state, rebuildable from events. The UI must never show a balance/status that contradicts the chain.

## 3. Monorepo layout
```
blutoken/
├─ AGENTS.md
├─ docs/                      # this spec pack
├─ contracts/                 # Cargo workspace (Sails)
│  ├─ app/                    # program + services (no_std)
│  ├─ client/                 # generated Rust client + blutoken.idl
│  ├─ tests/                  # gtest integration tests
│  └─ Cargo.toml
├─ packages/
│  └─ chain-client/           # TS client generated from the IDL (sails-js-cli), + helpers
├─ apps/
│  └─ web/                    # Next.js App Router, TypeScript, Tailwind, shadcn/ui
├─ services/
│  ├─ indexer/                # Node/TS: subscribes to program events -> Postgres
│  └─ mrv-worker/             # Python/FastAPI: Earth Engine, TF/OpenCV, report builder
├─ infra/
│  └─ docker-compose.yml      # postgres, (optional) local IPFS, local Vara node
└─ pnpm-workspace.yaml
```

## 4. Key flows

### 4.1 Report → mint
```
Owner UI ──(files)──► MRV worker ──► report bundle ──► IPFS (cid) ; sha256(bundle)=hash
Owner UI ──► Registry.submit_report(project, period, hash, cid, est_milli, method_v)  [on-chain]
Verifier UI (reads bundle by cid, re-checks hash) ──► Registry.vote_report(id, approve, note_hash)
On quorum: contract mints BLU to project treasury (owner) and records buffer; emits ReportVerified + Minted
Indexer ──► Postgres ──► UI updates
```

### 4.2 Buy → retire → reward
```
Owner: Market.create_listing(project, amount, price_per_milli)   (BLU moved to escrow)
Buyer: Market.buy(listing, amount) payable(VARA)  or  Market.buy_and_retire(listing, amount, retiree, reason)
Contract: transfers BLU (or burns + records Retirement), splits value: platform_fee_bps -> treasury, rest -> project.pending_revenue
Beneficiary: Market.claim_revenue(project)  -> native transfer of caller's share
```

### 4.3 Auth for off-chain API
Wallet signs a server-issued nonce (`signRaw`) → server verifies signature (`@polkadot/util-crypto`) → short-lived JWT in httpOnly cookie. Role is looked up from indexed on-chain roles. **On-chain permissions are always enforced by the contract; API auth only protects off-chain data.**

## 5. Environments
| Env | Chain endpoint | Purpose |
|---|---|---|
| local | local Vara dev node (`--dev`) | contract dev, gtest is primary |
| testnet | `wss://testnet.vara.network` | integration, demos |
| mainnet | `wss://rpc.vara.network` | production (after audit) |
Verify endpoints against the official docs before use; keep them in env vars.

## 6. Tech choices
| Concern | Choice |
|---|---|
| Contracts | Rust, `sails-rs` (pin latest stable), WASM, gtest |
| TS client | `sails-js`, `sails-js-cli` (generate from IDL), `@gear-js/api`, `@gear-js/react-hooks`, `@polkadot/api`, `@tanstack/react-query` |
| Web | Next.js (App Router), TS strict, Tailwind, shadcn/ui, Leaflet (react-leaflet), Recharts, next-intl |
| DB | Postgres + Prisma (or Drizzle) |
| Storage | IPFS via a pinning service (Pinata or similar) |
| MRV worker | Python 3.11, FastAPI, earthengine-api, rasterio, numpy, TensorFlow, OpenCV |
| Infra | Docker, GCP Cloud Run/GKE (per deck: GCP + Kubernetes), GitHub Actions |
