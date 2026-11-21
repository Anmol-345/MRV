# BluToken – Blue Carbon Registry & MRV (Vara + Next.js)

Spec pack for building the Team Indentt project with an AI coding agent (Google Antigravity).
Source: the "Blockchain-Based Blue Carbon Registry and MRV System" deck.

## Files (read in this order)

| File | Purpose |
|---|---|
| `AGENTS.md` | Rules the agent must follow. Copy to the **repo root**. |
| `01_PRD.md` | Product scope, roles, user stories, MVP vs later. |
| `02_ARCHITECTURE.md` | Layers, monorepo layout, data flow, trust boundaries. |
| `03_SMART_CONTRACTS_VARA.md` | Sails/Rust program: services, types, commands, events, errors, tests. |
| `04_OFFCHAIN_BACKEND.md` | Indexer, DB schema, REST API, IPFS, auth, IoT/satellite ingestion. |
| `05_MRV_AI_PIPELINE.md` | Satellite + AI + carbon math + verification rules. |
| `06_FRONTEND_NEXTJS.md` | Pages, components, wallet integration, design tokens. |
| `07_TASKS_AND_PROMPTS.md` | Phased build plan with copy-paste prompts and acceptance criteria. |
| `08_TESTING_DEPLOYMENT.md` | Test strategy, environments, deploy steps, security checklist. |

## Changes from the deck (decisions made for you)

1. **Solana → Vara Network.** BluToken is a Vara Fungible Token (VFT, the ERC-20 analogue) built with the **Sails** framework (Rust, WASM, Gear Protocol).
2. **"Backend on Vara" means on-chain programs.** Vara programs cannot run satellite processing, AI or databases. So there is a small **off-chain layer** (indexer + Postgres + MRV worker). The chain stores only hashes, roles, balances, listings and verification votes.
3. **Raw MRV data lives off-chain** (IPFS + Postgres); only its SHA-256 hash and CID are anchored on-chain.
4. **Added a reversal buffer** (percentage of each issuance withheld), a standard carbon-credit safeguard.

## How to use with Antigravity

1. Create an empty repo, add this folder as `/docs`, and copy `AGENTS.md` to the root. (Antigravity also reads workspace rules from `.agent/rules/`; you can copy `AGENTS.md` there too.)
2. Open the repo as the workspace. Use **Planning mode** with a strong model.
3. Paste prompts from `07_TASKS_AND_PROMPTS.md` **one phase at a time**. Ask for a plan first, approve it, then let it implement.
4. After Phase 2 (contract IDL frozen), run the indexer and web agents in parallel in the Manager view.
5. Do not skip the "verify against docs" instructions. Sails and gear-js APIs change between versions, so the agent must pin versions from the official docs and `cargo sails new` template rather than guess syntax.

## Honest caveats

- A BluToken is a **pilot registry token**. It is not a legally recognised carbon credit (e.g. under India's Carbon Credit Trading Scheme, Verra or Gold Standard) until the methodology and verifiers are accepted by such a body. The UI must say so.
- Carbon-stock parameters in this pack are **placeholders** for a domain expert (NCCR / marine scientist) to fill in. Do not ship invented numbers.
