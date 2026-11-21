# 04 – Off-chain Backend (indexer, DB, API)

The Vara program is the system of record. This layer exists for: fast queries, geospatial data, large files, time-series sensor data, and MRV compute.

## 1. Components
| Component | Tech | Location |
|---|---|---|
| REST API | Next.js route handlers (`app/api/**`) + Zod | `apps/web` |
| Indexer | Node/TS, `@gear-js/api` + `sails-js` event subscriptions | `services/indexer` |
| MRV worker | Python/FastAPI | `services/mrv-worker` |
| DB | Postgres (+ PostGIS if available) via Prisma | `apps/web/prisma` |
| File storage | IPFS pinning service | via server-side upload route |

## 2. Indexer requirements
- Connect to `VARA_WS_ENDPOINT`; subscribe to all program events; also **backfill** from `START_BLOCK` on first run or `--rebuild`.
- Store every event raw in `chain_events(block_number, event_index, service, name, payload_json, tx_hash, ts)` with a **unique (block_number, event_index)** → idempotent.
- Project events into read tables (projects, mrv_reports, votes, listings, trades, retirements, claims, balances).
- Handle reconnects and re-orgs (process only finalized blocks; keep `sync_state.last_finalized_block`).
- Expose `/health` with lag in blocks.
- A `pnpm indexer:rebuild` command truncates read tables and replays `chain_events`.

## 3. Database schema (Prisma-style, abbreviated)
```
Organization(id, name, kind[NCCR|MOEFCC|NGO|COOP|INDUSTRY], website)
User(wallet PK, display_name, org_id?, locale, created_at)               -- roles mirrored from chain
Project(id PK=chain id, owner_wallet, org_id, name, ecosystem, state_code,
        boundary_cid, boundary_geojson (jsonb/PostGIS), area_ha, status,
        total_minted, total_retired, buffer_held, pending_revenue, created_at, description, cover_image_cid)
Beneficiary(project_id, wallet, share_bps, display_name?)
MrvReport(id PK=chain id, project_id, submitter, period_start, period_end,
          data_hash, data_cid, estimated_milli, methodology_version, status, minted, buffered, created_at)
Vote(report_id, verifier_wallet, approve, note_hash, note_text?, ts)
SatelliteObservation(id, project_id, date, source[S2|LANDSAT|BHUVAN], ndvi_mean, canopy_ha, water_ha, cloud_pct, raster_cid?)
SensorDevice(id, project_id, public_key, kind[PH|SALINITY|SOIL_C|WATER_LEVEL], lat, lng, status, last_seen)
SensorReading(device_id, ts, value, unit, signature_ok bool)             -- partition by month
CitizenReport(id uuid, reporter_wallet?, project_id?, kind[MANGROVE_LOSS|POLLUTION|RECLAMATION|DEAD_ZONE|OTHER],
              lat, lng, description, photo_cids[], status[NEW|TRIAGED|CONFIRMED|DISMISSED], anchored_hash?, created_at)
Listing(id PK=chain id, project_id, seller, remaining, price_per_milli, active, created_at)
Trade(id, listing_id, buyer, amount, value, retired bool, tx_hash, ts)
Retirement(id PK=chain id, project_id, retiree, amount, beneficiary_name, reason, ts, certificate_cid?)
RevenueClaim(id, project_id, wallet, amount, ts)
Balance(wallet PK, balance_milli)                                         -- derived from Transfer/Minted/Burned
ChainEvent(block_number, event_index, service, name, payload jsonb, tx_hash, ts) UNIQUE(block_number,event_index)
SyncState(key PK, value)
```
Add indexes: Project(status, state_code), MrvReport(project_id,status), CitizenReport(status, geo), Retirement(retiree).

## 4. REST API (all inputs Zod-validated; paginated with `?limit&cursor`)
Public (no auth)
```
GET  /api/stats                         totals: area, minted, retired, active projects, last block
GET  /api/projects                      filters: state, ecosystem, status, bbox
GET  /api/projects/:id                  detail + reports + beneficiaries
GET  /api/projects/:id/observations     satellite time series
GET  /api/reports/:id                   report + votes + bundle metadata
GET  /api/listings                      active marketplace
GET  /api/retirements/:id               certificate data
GET  /api/audit                         chain_events feed (filter by service/name/project)
GET  /api/citizen-reports               public, anonymised exact coords for non-owners
```
Authenticated (wallet-session)
```
POST /api/auth/nonce                    {wallet} -> {nonce}
POST /api/auth/verify                   {wallet, signature} -> sets cookie
POST /api/uploads                       multipart -> pins to IPFS, returns {cid, sha256}
POST /api/citizen-reports               create (reporter optional; rate-limited)
PATCH /api/citizen-reports/:id          verifier/NGO triage
POST /api/projects/:id/mrv-jobs         owner: trigger MRV worker for period -> jobId
GET  /api/mrv-jobs/:id                  status + result bundle cid/hash/estimate
POST /api/devices                       owner registers sensor public key
POST /api/ingest/sensor                 device-signed batch (ed25519), no wallet session
```
Internal
```
POST /internal/mrv/callback             worker -> API (shared secret / mTLS)
```

## 5. Sensor ingestion
- Each device has an **ed25519 key pair**; public key registered by owner.
- Payload: `{device_id, readings:[{ts,value,unit}], nonce}` + signature. Server verifies, rejects replays (nonce/ts window), stores readings.
- Periodically the MRV worker includes aggregated sensor stats + a Merkle root of raw readings in the report bundle.

## 6. IPFS handling
- Server-side upload only (API key never reaches browser).
- Return `{cid, sha256, size, mime}`; the **client recomputes sha256** of the bundle it submits on-chain; verifiers' UI recomputes it from the fetched bundle and flags mismatches.
- Use a configurable gateway list; never trust a single gateway.

## 7. Security
- Rate-limit public POSTs; image type/size limits; strip EXIF GPS **only from public derivative**, keep original in private store if needed for verification.
- CSRF protection for cookie auth; CORS locked to the web origin.
- Secrets via env/secret manager. Service-account for Earth Engine only in the worker.
- Store only wallet addresses + optional display names (no Aadhaar/phone). Provide a data-deletion route for off-chain personal data.

## 8. Env vars (`.env.example`)
```
DATABASE_URL=
VARA_WS_ENDPOINT=wss://testnet.vara.network
BLUTOKEN_PROGRAM_ID=0x...
START_BLOCK=
IPFS_PINNING_JWT=
IPFS_GATEWAYS=https://ipfs.io/ipfs/,https://cloudflare-ipfs.com/ipfs/
SESSION_SECRET=
MRV_WORKER_URL=
MRV_SHARED_SECRET=
EE_SERVICE_ACCOUNT_JSON_PATH=   # worker only
```
