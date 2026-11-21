# AGENTS.md – rules for the coding agent

## Project
BluToken: blockchain registry + MRV platform for India's blue carbon (mangroves, seagrass, salt marsh).
Backend = Vara Network programs (Rust + Sails). Frontend = Next.js (App Router, TypeScript).
Specs are in `/docs`. They are the source of truth. If something is ambiguous, write the assumption in `/docs/DECISIONS.md` and continue.

## Hard rules
1. **Never guess library APIs.** Before writing Vara/Sails/gear-js code, read the official docs (https://wiki.vara.network, https://github.com/gear-tech/sails, https://github.com/gear-tech/gear-js) and scaffold with the official Sails template (`cargo sails new` or the current documented equivalent). Pin exact versions in `Cargo.toml` / `package.json` and record them in `/docs/DECISIONS.md`.
2. **Build and test before saying "done".** Every task ends with: `cargo build --release`, `cargo test`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (whichever apply) passing. Report the actual output.
3. **No secrets in git.** Use `.env.local` / `.env.example`. Never commit seed phrases, API keys, or service-account JSON.
4. **Money and carbon math is integer-only** on-chain (`u128`/`u64`, no floats). Use fixed units: 1 BLU = 1 tCO2e, 3 decimals (milli-tonnes). VARA amounts are in planck.
5. **Never store raw data on-chain.** Only hashes, CIDs, ids, balances, votes.
6. **No unbounded loops in contract commands.** Paginate queries. Use pull-payments (`claim_revenue`), not push loops.
7. **Contract first.** Do not build UI features that need contract methods that don't exist. Change the spec file first, then the code.
8. **Next.js wallet code is client-only.** Use `"use client"` and dynamic import with `ssr: false` for anything touching `window`, wallet extensions or `@gear-js/*` providers.
9. **Be honest in UI copy.** Show a visible note that BluTokens are pilot registry tokens, not government-certified credits.
10. Keep changes small and committed per task with conventional commit messages.

## Conventions
- Monorepo with pnpm workspaces + Cargo workspace (see `docs/02_ARCHITECTURE.md`).
- TypeScript strict mode. Zod for all API input validation.
- Rust: `#![no_std]` program crate, `cargo clippy -- -D warnings`, `cargo fmt`.
- Tailwind + shadcn/ui. Design tokens in `docs/06_FRONTEND_NEXTJS.md`.
- Tests live beside the code they test. Contract tests use `gtest` via sails-rs.

## When stuck
Stop, summarise what you tried, and ask. Do not fabricate APIs, contract addresses, endpoints or carbon coefficients.
