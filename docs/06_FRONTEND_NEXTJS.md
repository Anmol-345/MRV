# 06 – Frontend (Next.js)

## 1. Stack
Next.js (App Router) · TypeScript strict · Tailwind · shadcn/ui · react-leaflet · Recharts · next-intl (en + hi first) · TanStack Query · `@gear-js/api`, `@gear-js/react-hooks`, `sails-js`, `@polkadot/api`, `@polkadot/extension-dapp` (or the wallet integration provided by `@gear-js/react-hooks`) · generated client in `packages/chain-client`.

## 2. Vara integration (client-only)
- Wrap the app in a client component `<ChainProviders>` containing, in this order: `QueryClientProvider` → `ApiProvider` (initialArgs `{ endpoint: process.env.NEXT_PUBLIC_VARA_WS }`) → `AccountProvider` (`appName="BluToken"`) → `AlertProvider`. Verify current provider names/props against the `@gear-js/react-hooks` README.
- Load it with `dynamic(() => import('./chain-providers'), { ssr: false })` so nothing touching `window` runs on the server.
- Use `useProgram` (with the generated `Program` class + `NEXT_PUBLIC_PROGRAM_ID`), `useProgramQuery` for reads, `useSendProgramTransaction` for writes, `useProgramEvent` for live updates. `usePrepareProgramTransaction` to show fee estimates before signing.
- **Reads**: prefer the REST API (indexed, paginated, fast) for lists/maps/dashboards; use on-chain queries for the "source of truth" checks (balances, claimable amount, report status before voting).
- **Writes**: always on-chain via the wallet; after `signAndSend` resolves, optimistically show "pending", then reconcile when the indexer reflects the event.
- Show tx lifecycle states: *awaiting signature → in block → finalized → failed (with decoded contract error)*. Map contract error enum to friendly text.
- Phase 2: gasless/signless for community members using Gear vouchers / the EZ-Transactions package.

## 3. Information architecture (routes)
```
/                         Landing: mission, live stats, map teaser, "pilot tokens" notice
/map                      Public map of projects + citizen reports (Leaflet)
/projects                 List/filter
/projects/[id]            Overview · Reports · Satellite trends · Beneficiaries · Audit trail
/audit                    Public event explorer (filter by project/service), links to block explorer
/market                   Listings; buy / buy & retire
/retire/[id]              Public retirement certificate (printable, QR to tx)
/report-threat            Citizen reporting PWA (offline queue, camera, geotag)
/dashboard                Role-aware home
/dashboard/owner          My projects, new project wizard, submit MRV report, listings, revenue
/dashboard/verifier       Verification queue + report review screen
/dashboard/community      My shares, claimable revenue, my citizen reports
/dashboard/buyer          BLU balance, purchases, retirements, certificates
/dashboard/gov            National/regional KPIs, alerts, anomaly feed, export CSV
/admin                    Roles, params, pause, reversals
/about  /methodology      Methodology + legal disclaimer
```

## 4. Key screens – requirements
**Project wizard**: name → ecosystem → draw/upload boundary (Leaflet draw or GeoJSON upload; compute area client-side, validate no overlap via API) → beneficiaries with live "sum must be 100%" → review → sign `register_project`.

**Submit MRV report**: choose period → "Run analysis" (calls `/api/projects/:id/mrv-jobs`, shows progress) → preview bundle summary (area change, Δ stock, tCO2e net, uncertainty, evidence thumbnails) → client verifies `sha256` → sign `submit_report`.

**Verifier review**: left = checklist with automatic checks (hash match, overlap, cloud, outliers, sensors); center = map with before/after imagery slider; right = vote panel (approve/reject + note). Disable vote if conflict-of-interest; show current quorum progress (e.g., "1/2 approvals · orgs 1/2").

**Market**: cards with project, ecosystem, vintage, price, remaining. `Buy` and `Buy & retire` modals show total VARA, platform fee, fee estimate, and exact post-state. Retire flow collects beneficiary name + reason, then links to the certificate page.

**Certificate**: project, amount (tCO2e), retiree, date, tx hash, block explorer link, QR, "pilot registry token – not a government-certified credit" footer.

**Citizen report (PWA)**: works offline (IndexedDB queue + service worker), captures photo(s), GPS (with manual pin fallback), category, note; submits when online; shows status. Language switcher always visible.

**Gov dashboard**: KPI cards (ha monitored, tCO2e minted/retired, active projects, pending verifications), time-series, state-wise choropleth, alerts list (anomalies, sensor offline, citizen-report clusters), CSV export.

## 5. Components (shared)
`WalletButton` · `NetworkBadge` · `TxToast` · `AmountInput` (BLU 3-dec / VARA 12-dec safe, BigInt only) · `AddressChip` (copy, explorer link) · `ProjectMap` · `BoundaryEditor` · `ReportChecklist` · `BeforeAfterSlider` · `QuorumMeter` · `StatCard` · `TimeSeriesChart` · `CertificateCard` · `EmptyState` · `ErrorBoundary`.
Numbers: **never use JS `number` for chain amounts**; use `bigint` and format helpers (`formatBlu`, `formatVara`).

## 6. Design tokens (approximate, taken from the deck)
```
--deep-green:   #203D2E   /* hero / dark surfaces */
--forest:       #2D5F2D   /* headings, primary */
--leaf:         #6B9A4F   /* accents, success */
--lime:         #9BC15D   /* highlights on dark */
--teal:         #20707A   /* data / satellite / water */
--earth:        #8C6B45   /* sediment, warnings, secondary */
--mist:         #F3F5EE   /* page background */
--card:         #FFFFFF
--ink:          #1F2A24
--muted:        #66726B
```
Type: serif display for headings (e.g. Cambria/Georgia → pick a web font such as "Source Serif 4"), clean sans for body (Inter / Calibri-like). Rounded cards (12–16 px), soft shadows, generous whitespace. Light + dark themes. Icons: lucide-react.

## 7. Accessibility, i18n, performance
- WCAG AA; keyboard-navigable modals; map has list alternative.
- `next-intl` with `en`, `hi` at MVP; keys, not hardcoded strings; number/date formatting per locale.
- Lazy-load map and charts; image optimisation; PWA manifest + service worker (offline report queue only; don't cache wallet/API writes).

## 8. Frontend env
```
NEXT_PUBLIC_VARA_WS=wss://testnet.vara.network
NEXT_PUBLIC_PROGRAM_ID=0x...
NEXT_PUBLIC_EXPLORER_URL=
NEXT_PUBLIC_API_BASE=/api
```

## 9. Frontend tests
Vitest + Testing Library for components; Playwright for flows with a **mocked wallet/chain** (and one slow e2e against testnet): register project, submit report, vote, buy & retire, claim.
