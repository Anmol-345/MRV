# 01 – Product Requirements

## 1. Vision
Record India's coastal blue-carbon ecosystems on-chain as **BluTokens**, with transparent monitoring, reporting and verification (MRV) anyone can audit, and revenue that flows to the coastal communities doing the restoration.

## 2. Problems (from the deck) → what we build
| Problem | Feature |
|---|---|
| Centralised, opaque MRV | Every report, vote and issuance is an on-chain event; public audit explorer |
| Weak/standardised baseline data, no satellite integration | MRV pipeline using Sentinel-2/Landsat/Bhuvan + versioned methodology |
| Bureaucratic, siloed approvals | Smart-contract approval workflow with quorum verification |
| Communities excluded | Mobile-first PWA for citizen reporting, transparent revenue share, local-language UI |

## 3. Roles
| Role | Who | Can do |
|---|---|---|
| `Admin` | MoEFCC / NCCR governance | Manage roles, set quorum & buffer, pause, resolve disputes |
| `Verifier` | NCCR scientists, accredited NGOs | Approve/reject MRV reports (not for own projects) |
| `ProjectOwner` | NGO / community cooperative | Register project, submit MRV reports, list credits |
| `Beneficiary` | Community members | Receive revenue share, claim earnings, submit citizen reports |
| `Buyer` | Industry | Buy and retire credits, download retirement certificate |
| `Public` | Anyone | Read registry, audit trail, map, stats (no wallet needed) |

## 4. Core user journeys
1. **Register project**: owner submits name, ecosystem type, boundary polygon (GeoJSON → IPFS), beneficiary split (basis points, sum = 10 000) → Admin activates.
2. **Monitor**: satellites, drones, IoT sensors and community field data are collected (off-chain) for each project.
3. **Analyse**: MRV worker computes area + carbon-stock change for the period and produces a report bundle (JSON + evidence) pinned to IPFS.
4. **Submit report**: owner calls `submit_report` with period, `data_hash`, `data_cid`, `estimated_milli_tco2e`, `methodology_version`.
5. **Verify**: ≥ `quorum` distinct verifiers (from ≥ `min_orgs` organisations) approve. On the final approval the contract **mints** BLU = estimate × (1 − buffer).
6. **List & sell**: owner lists BLU at a VARA price per unit; industry buys.
7. **Offset**: buyer retires BLU (burn) with beneficiary name + reason → public retirement certificate.
8. **Reward**: sale revenue accrues to project; beneficiaries `claim_revenue` pro-rata.
9. **Citizen reporting**: anyone geotags a threat (mangrove cutting, pollution, reclamation) with photos; NGOs/verifiers triage.

## 4a. Functional requirements (MVP = P0)
| ID | Pri | Requirement |
|---|---|---|
| F1 | P0 | Wallet connect (Polkadot-js compatible wallets: SubWallet, Talisman, Polkadot{.js}) |
| F2 | P0 | Project registry with map and boundary |
| F3 | P0 | MRV report submission + verification queue + quorum voting |
| F4 | P0 | BLU mint on verification; VFT transfer/approve |
| F5 | P0 | Marketplace: list, buy, cancel; buy-and-retire |
| F6 | P0 | Revenue split + beneficiary claim |
| F7 | P0 | Public audit explorer (events with links to block explorer) |
| F8 | P0 | Gov dashboard: total area, tCO2e minted/retired, project status, alerts |
| F9 | P1 | Citizen reporting PWA, offline queue, photo + geotag |
| F10 | P1 | Satellite pipeline (NDVI / mangrove extent change) via Earth Engine |
| F11 | P1 | IoT sensor ingestion (pH, salinity, soil carbon) with signed payloads |
| F12 | P1 | Gasless transactions for community members (vouchers / EZ-Transactions) |
| F13 | P2 | AI segmentation model (TensorFlow/OpenCV) replacing simple NDVI classifier |
| F14 | P2 | Hindi + regional languages, USSD/SMS fallback |
| F15 | P2 | Extend to coral reefs / wetlands; multi-token (VMT) per project-vintage |

## 5. Non-functional requirements
- Public read pages load < 2.5 s on 4G; PWA works offline for citizen reports.
- All on-chain writes are idempotent-safe on the client (no double-submit).
- Indexer can rebuild the entire DB from chain events (disaster recovery).
- WCAG AA contrast; mobile-first.
- Auditability: any number shown in the UI can be traced to an on-chain event or a hashed dataset.

## 6. Out of scope for MVP
Fiat payments, KYC for buyers, cross-chain bridge, legal certification of credits, secondary-market order book, DAO governance.

## 7. Success metrics (pilot)
Projects onboarded, hectares monitored, reports verified, median report→mint time, BLU retired, % revenue delivered to beneficiaries, citizen reports triaged.

## 8. Risks
High setup cost → start with pilots; data gaps → methodology versioning + expert review; low community adoption → local-language app + awareness; harsh-environment sensors → redundancy + sensor health alerts; regulation → keep legal disclaimer, engage policymakers.
