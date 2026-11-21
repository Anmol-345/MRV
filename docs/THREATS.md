# BluToken Threat Model & Security Architecture

## 1. System Overview & Trust Boundaries
BluToken combines on-chain state transition guarantees on Vara Network (via Sails actors) with decentralized off-chain MRV (Sentinel-2 earth observation, IoT telemetry, citizen reports).

```
   [ Untrusted Internet / Public Clients ]
                    │
            ┌───────┴───────┐
            │  WAF / HTTPS  │ (Rate Limiting, Strict CSP, HSTS)
            └───────┬───────┘
                    ▼
     ┌─────────────────────────────┐
     │      Next.js Web / API      │ <── (JWT httpOnly, Zod Validation)
     └──────┬───────────────┬──────┘
            │               │
            ▼               ▼
┌──────────────────┐ ┌───────────────────┐
│ Postgres Read DB │ │ MRV Worker Engine │ (Sentinel-2, QA Mask, Carbon Math)
└──────────────────┘ └───────────────────┘
            ▲
            │ (Idempotent Event Ingestion)
┌───────────────────────────────────────┐
│         Vara Network Smart Program    │ (WASM, Integer Math, State Isolation)
│  - Admin: Roles & Circuit Breakers    │
│  - Bluvft: Internal Mint/Burn VFT     │
│  - Registry: Projects & Quorum MRV    │
│  - Market: Order Book & Pull Payments │
└───────────────────────────────────────┘
```

---

## 2. Threat Categories & Mitigations

### T1: On-Chain Economic & Supply Invariant Attacks
| Attack Vector | Impact | Architectural Mitigation |
|---|---|---|
| **Arbitrary Minting of BLU** | Infinite inflation, registry collapse | `Bluvft` mint/burn are strictly internal functions (`#Bluvft.mint()`). Uncallable by external messages; minting occurs *only* within `Registry.finalize_and_mint()` upon verified quorum. |
| **Double Voting / Sybil Verifiers** | Fraudulent approval of false credits | Smart contract enforces `min_orgs` distinct organization IDs. An organization cannot vote twice on the same report. |
| **Developer Conflict of Interest** | Developer verifies own project | Contract asserts `submitter != verifier` and verifies verifier organization is not associated with project developer. |
| **Revenue Siphoning on Claim** | Malicious actor drains community funds | Pull-payment architecture with state updated *before* transfer (`state.claimable[p][who] = 0` prior to native transfer). |
| **Integer Overflow / Underflow** | Accounting exploitation | All financial (VARA planck) and carbon (milli-tCO2e) math uses Rust checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`). Panics prevent state corruption. |

---

### T2: MRV Oracle & Earth Observation Spoofing
| Attack Vector | Impact | Architectural Mitigation |
|---|---|---|
| **Fabricated Satellite Imagery** | Minting credits for degraded land | Reports commit cryptographic SHA-256 hash of canonical RFC 8785 JSON bundle. Verifiers independently re-run pipeline via `POST /verify/:cid` checking Sentinel-2 L2A scene IDs against public ESA Copernicus archives. |
| **Cloud Occlusion Masking** | Concealing deforestation behind clouds | Cloud masking algorithms inspect QA60 and Scene Classification Layer (SCL); reports with $> 15\%$ cloud cover are automatically flagged and rejected. |
| **Overlapping Monitoring Periods** | Double-counting carbon sequestration | Invariant 7: Registry rejects any report whose `[period_start, period_end]` collides with an existing verified period. |
| **Fake Ecological Coefficients** | Inflated biomass and sequestration | `carbon_params.yaml` requires cited domain-expert calibration (NCCR / IPCC); worker strictly crashes if any `TODO` placeholder exists. Demo runs are explicitly tagged `DEMO`. |

---

### T3: IoT Sensor Tampering & Replay Attacks
| Attack Vector | Impact | Architectural Mitigation |
|---|---|---|
| **Sensor Telemetry Replay** | Forging false water/salinity health | Sensor packets require ed25519 signatures, strictly monotonic sequence counters, and a $\pm 300\text{s}$ timestamp freshness window. |
| **Sensor Physical Tampering** | Deceiving hydrological baseline | Statistical outlier detection flags readings outside physiological bounds (salinity $< 5$ or $> 45\text{ ppt}$, water level $> 3\sigma$ from tidal harmonics). |

---

### T4: Citizen Reporting Spam & Anonymity Risks
| Attack Vector | Impact | Architectural Mitigation |
|---|---|---|
| **Denial of Service / Report Spam** | Flooding moderation queue | Rate limiting per IP, CAPTCHA thresholding, and client-side proof-of-work limits. |
| **Citizen Retaliation / PII Leak** | Doxxing rural reporters | Geolocation coordinates are automatically truncated to 4 decimal places ($\sim 11\text{m}$ grid); reporters can submit anonymously with zero wallet association. |

---

### T5: Key Compromise & Operational Resilience
| Attack Vector | Impact | Architectural Mitigation |
|---|---|---|
| **Admin Key Compromise** | Malicious protocol takeover | Critical parameter changes subject to timelock; emergency circuit breaker (`pause()`) can halt contract actions without trapping accumulated community revenue. |
| **Indexer Outage / DB Corruption** | UI desynchronization | Zero-loss recovery: Indexer read database is 100% rebuildable from immutable on-chain event history (`pnpm indexer:rebuild`). |

---

## 3. Security Invariant Matrix

1. **Conservation of Supply**: $\text{Total Supply} + \text{Total Retired} + \text{Buffer Pool} = \sum \text{Verified Minted}$.
2. **Buffer Pool Reserve**: Exactly $20\%$ ($2,000\text{ bps}$) of every minted batch is allocated to the protocol buffer pool to cover reversals.
3. **Pull Payment Invariant**: Zero push-transfers in contract loops. All revenue claims are pulled individually.
4. **No Raw Secrets in Git**: Zero seed phrases, private keys, or API tokens committed. Monitored by CI automated pre-commit scanners.
