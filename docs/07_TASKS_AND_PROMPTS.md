# 07 – Phased Build Plan & Antigravity Prompts

Use one phase per agent session. Each prompt starts with "Read AGENTS.md and the listed docs." Ask for a **plan first**, review, then implement. Each phase has acceptance criteria — do not proceed until they pass.

---
## Phase 0 – Scaffold (monorepo)
**Prompt**
> Read AGENTS.md, docs/02_ARCHITECTURE.md. Create the monorepo layout exactly as specified: pnpm workspace, Cargo workspace in `contracts/` scaffolded with the official Sails template (look up the current command in the Vara docs), `apps/web` (Next.js App Router, TS strict, Tailwind, shadcn/ui), `packages/chain-client`, `services/indexer`, `services/mrv-worker` (FastAPI skeleton), `infra/docker-compose.yml` (Postgres). Add lint/format/typecheck scripts, `.env.example` files, GitHub Actions CI. Record all pinned versions in docs/DECISIONS.md.

**Accept:** `pnpm install && pnpm build` and `cargo build --release` succeed; CI green; `docker compose up` starts Postgres.

---
## Phase 1 – Contract core: Admin + Bluvft
**Prompt**
> Read docs/03_SMART_CONTRACTS_VARA.md sections 1–3, 5–8. Implement the `Admin` and `Bluvft` services using the official VFT standard approach. Internal-only mint/burn. Add gtest tests for roles, params validation, pause, transfer/approve/transfer_from and supply invariants. Generate and commit `blutoken.idl`.

**Accept:** all tests pass; clippy clean; IDL generated; invariants 1 & 9 tested.

---
## Phase 2 – Contract: Registry + Market
**Prompt**
> Implement `Registry` and `Market` per docs/03_SMART_CONTRACTS_VARA.md. Follow the finalize-and-mint math exactly, quorum with min distinct orgs, conflict-of-interest rule, accumulator-based revenue split, pull-payment claims (state update before transfer), `buy`, `buy_and_retire`, `retire`. Implement every event and typed error. Write the full test plan from section 9 including rounding and property tests. Update the IDL and regenerate `packages/chain-client` with sails-js-cli (verify command in docs).

**Accept:** every invariant (1–9) has a passing test; end-to-end happy path test passes; IDL + TS client committed; no `unwrap`/panic on user input.

**Gate: freeze the IDL.** After this, contract changes require updating docs/03_SMART_CONTRACTS_VARA.md first.

---
## Phase 3 – Deploy to testnet + CLI smoke test
**Prompt**
> Write `contracts/scripts/deploy` (TypeScript using the generated client) that uploads the WASM, initialises the program with params, grants roles to test accounts, and prints the program id. Write a smoke script that runs register → activate → submit → 2 votes → list → buy_and_retire → claim against testnet. Document steps in docs/08_TESTING_DEPLOYMENT.md.

**Accept:** program id on testnet; smoke script succeeds; program id saved to `.env.example` comment (not secrets).

---
## Phase 4 – Indexer + DB + API  *(can run parallel with Phase 5 after IDL freeze)*
**Prompt**
> Read docs/04_OFFCHAIN_BACKEND.md. Implement Prisma schema, the indexer (backfill + live subscribe, idempotent, finalized blocks only, `--rebuild`), and the REST API with Zod validation and pagination. Add wallet-signature auth (nonce → signRaw verify → httpOnly JWT cookie) and IPFS upload route. Provide integration tests using a recorded set of events.

**Accept:** run smoke script from Phase 3 → DB reflects all entities; `pnpm indexer:rebuild` reproduces identical tables; API tests pass; `/health` shows lag.

---
## Phase 5 – Web app foundations
**Prompt**
> Read docs/06_FRONTEND_NEXTJS.md sections 1–3, 5–8. Set up providers (client-only), wallet connect, network badge, i18n (en, hi), theme tokens, layout, role-aware nav. Build `/`, `/projects`, `/projects/[id]`, `/audit`, `/market` (read-only) against the API. Verify provider/hook names against current `@gear-js/react-hooks` docs before coding.

**Accept:** app builds; no SSR errors; wallet connects on testnet; lists render from indexed data; Lighthouse mobile ≥ 85.

---
## Phase 6 – Owner, verifier, buyer, community flows
**Prompt**
> Implement the project wizard, MRV report submission (use a stub MRV job returning a `DEMO`-tagged bundle for now), verifier review screen with automatic checks (hash recompute), voting with quorum meter, listing creation, buy / buy & retire, certificate page, claim revenue, and `/admin`. All amounts as BigInt. Map every contract error to friendly text. Add Playwright flows with a mocked wallet.

**Accept:** full journey works on testnet via UI; Playwright flows pass; certificate page is printable.

---
## Phase 7 – MRV worker (real pipeline) + citizen PWA + gov dashboard
**Prompt**
> Read docs/05_MRV_AI_PIPELINE.md. Implement the worker: Earth Engine Sentinel-2 composites with cloud masking, NDVI-threshold classification, area change, carbon math using `carbon_params.yaml` (refuse to run with TODO values; ship `demo_params.yaml` for demos), canonical bundle + sha256 + IPFS pin, async jobs with callback. Then build the citizen-reporting PWA (offline queue, camera, geotag) and gov dashboard (KPIs, choropleth, alerts, CSV export). Add sensor ingestion with ed25519 verification.

**Accept:** a real job on a sample polygon returns a bundle whose hash matches on-chain after submit; PWA works offline in airplane mode test; dashboard numbers reconcile with chain totals.

---
## Phase 8 – Hardening
**Prompt**
> Run the security checklist in docs/08_TESTING_DEPLOYMENT.md. Add rate limits, input limits, CSP, dependency audit, secrets scan. Write a threat model (docs/THREATS.md). Add observability (structured logs, metrics, alerts for indexer lag and worker failures). Prepare mainnet runbook.

**Accept:** checklist complete; external contract audit scheduled before mainnet.

---
## Parallelisation hints (Manager view)
- After Phase 2: Agent A = indexer/API (Phase 4), Agent B = web foundations (Phase 5), Agent C = MRV worker skeleton (Phase 7a). Merge via PRs; keep the IDL as the contract between them.

## Definition of done (every task)
Builds · lint · typecheck · tests pass · docs updated if behaviour changed · no secrets · brief changelog entry.
