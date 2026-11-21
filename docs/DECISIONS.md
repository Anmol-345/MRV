# Architectural Decision Records & Pinned Versions (DECISIONS.md)

This document records the exact tool, library, and framework versions pinned across BluToken, as well as assumptions and architectural design decisions made during the project lifecycle.

---

## 1. Pinned Tool & Library Versions

| Area | Component / Tool | Pinned Version | Decision Context & Source |
|---|---|---|---|
| **Contracts** | `sails-rs` | `0.6.3` | Core smart contract framework for Vara Network (Gear Protocol). Tested on `crates.io/crates/sails-rs`. |
| **Contracts** | `sails-cli` | `0.6.3` | CLI utility used for scaffolding (`cargo sails new`) and project automation. |
| **Contracts** | Rust toolchain | `1.96.0` (stable) | Rust compiler with `wasm32-unknown-unknown` target for WASM compilation. |
| **Contracts** | `gtest` | via `sails-rs 0.6.3` | Gear gtest deterministic smart contract integration testing harness. |
| **Chain Client** | `sails-js` | `1.0.0` | Runtime library for executing Sails IDL operations and SCALE encoding. |
| **Chain Client** | `sails-js-cli` | `0.6.0` | CLI tool generating TypeScript client wrappers from `blutoken.idl`. |
| **Chain Client** | `@gear-js/api` | `^0.45.0` | Gear/Substrate blockchain RPC API and transaction builder. |
| **Chain Client** | `@polkadot/api` | `^14.0.1` | Underlying Substrate RPC, SCALE codec, and cryptographic primitives. |
| **Frontend** | `@gear-js/react-hooks` | `^0.19.1` | React context providers (`ApiProvider`, `AccountProvider`, `AlertProvider`) and hooks (`useAccount`, `useApi`, `useAlert`, `useProgram`). |
| **Frontend** | Next.js | `^15.2.0` | App Router, Server/Client components, route handlers. |
| **Frontend** | React | `^19.0.0` (or `^18.3.1`) | UI rendering engine. |
| **Frontend** | Tailwind CSS | `^3.4.17` | Utility-first styling configured with BluToken natural ocean & coastal palette. |
| **Frontend** | TypeScript | `^5.7.0` | Strict type checking (`strict: true`, `noImplicitAny: true`). |
| **Database** | Prisma | `^6.4.0` | ORM for PostgreSQL and PostGIS data modeling. |
| **Database** | PostgreSQL | `16-alpine` | Relational database engine for indexed state and telemetry. |
| **Worker** | Python | `3.11` | Runtime for MRV worker and geospatial processing libraries. |
| **Worker** | FastAPI | `^0.115.0` | Asynchronous REST service framework for MRV analysis worker. |
| **Worker** | Uvicorn | `^0.32.0` | ASGI web server. |
| **Package Mgr**| pnpm | `^9.15.0` | Fast, disk space efficient monorepo package manager. |
| **Containers** | Docker Engine | `29.4.0` | Container runtime for Postgres database and worker microservices. |

---

## 2. Key Architectural Decisions

### ADR 001: Shared Database Package (`packages/database`)
- **Context:** `docs/04_OFFCHAIN_BACKEND.md` placed the database schema at `apps/web/prisma`, while `services/indexer` must ingest blockchain events directly into Postgres. In a monorepo, having a backend service import Prisma models from `apps/web` violates package isolation boundaries.
- **Decision:** Create `packages/database` which houses `prisma/schema.prisma` and exports the generated `@prisma/client`. Both `apps/web` and `services/indexer` consume `@blutoken/database` as a workspace dependency.

### ADR 002: Integer-Only Math & Fixed Currency/Carbon Granularity
- **Context:** Floating point arithmetic is non-deterministic and forbidden on-chain.
- **Decision:**
  - Carbon credit unit: **1 BLU = 1 tCO2e**, with 3 decimals (1 milli-tCO2e = $10^{-3}$ tCO2e = `1` integer unit).
  - Currency unit: VARA in `planck` ($10^{-12}$ VARA).
  - Marketplace pricing: `price_per_milli` represents VARA in planck per 1 milli-BLU.
  - Total purchase price formula: $\text{total\_planck} = \text{amount\_milli} \times \text{price\_per\_milli}$.

### ADR 003: VFT Internal Mint & Burn
- **Context:** The BluToken VFT (`Bluvft`) standard token interface must prevent unauthorized minting or burning. In Sails, any public method in a `#[service]` struct is callable externally.
- **Decision:** `mint` and `burn` are strictly internal crate functions within `contracts/app`. They are invoked exclusively by `Registry` (when an MRV report reaches verified quorum) and `Market` (when credits are purchased for retirement or directly retired). No external transaction can trigger them directly.

### ADR 004: Client-Only Web3 Integration in Next.js
- **Context:** Substrate and Gear wallet extensions (`window.injectedWeb3`) and `@gear-js` providers require the browser environment (`window`). Evaluating them during Next.js Server-Side Rendering (SSR) causes hydration and reference errors.
- **Decision:** All wallet connection and provider contexts are encapsulated within `components/providers/chain-providers.tsx` and dynamically imported in `app/layout.tsx` using `next/dynamic` with `{ ssr: false }`.

### ADR 005: Pilot Registry Disclaimer
- **Context:** BluTokens represent pilot registry carbon offsets and are not legal regulatory credits under government certification schemes (e.g. CCTS, Verra).
- **Decision:** A mandatory, visible disclaimer badge is displayed across public UI views, marketplace listings, and generated retirement certificates: *"BluTokens are pilot registry tokens, not government-certified credits."*

### ADR 006: Thread-Local State Isolation for Native Cargo Tests
- **Context:** In Sails smart contracts running in integration tests outside WASM, multiple tests execute concurrently in parallel threads across the test harness. Shared static mutex state causes cross-test data race conditions and unexpected state mutations.
- **Decision:** On `cfg(not(target_arch = "wasm32"))`, contract state `STORAGE` is managed via `std::thread_local!` with `core::cell::RefCell<Option<Storage>>`. On `cfg(target_arch = "wasm32")`, `STORAGE` uses `sails_rs::spin::Mutex`. This guarantees 100% test isolation with zero concurrency interference during native test runs.

### ADR 007: Phase 2 IDL Freeze & sails-js-cli Service Property Collision Resolution
- **Context:** Per `docs/03_SMART_CONTRACTS_VARA.md` and `docs/07_TASKS_AND_PROMPTS.md`, Phase 2 requires implementing `Admin`, `Bluvft`, `Market`, and `Registry` services and freezing the generated IDL (`contracts/client/blutoken.idl`). When `sails-js-cli` generates TypeScript wrappers, it hardcodes `public readonly registry: TypeRegistry;` for Polkadot types while simultaneously defining `public readonly registry: Registry;` for the Sails `Registry` service, resulting in a duplicate identifier compiler error.
- **Decision:** The program IDL `contracts/client/blutoken.idl` is officially frozen for Phase 2. A deterministic post-processing step in `packages/chain-client/scripts/generate.js` renames the internal Polkadot TypeRegistry field to `this.typeRegistry`, preserving the canonical `program.registry` service API for callers while ensuring strict TypeScript compilation with zero errors.

