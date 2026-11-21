# 03 – Vara Smart Contracts (Sails)

> **Important:** The Rust below describes *shape and semantics*, not final macro syntax. Sails changed between versions (older releases use `#[service]`/`#[program]`; newer ones use `#[export]` and a 1.0 IDL format). The agent MUST scaffold from the official template, pin the latest stable `sails-rs`, and adapt this spec to that syntax. Do not copy the pseudo-code blindly.

## 1. Program structure
One program `BluTokenProgram` exposing these services (routes):

| Service | Responsibility |
|---|---|
| `Admin` | roles, parameters, pause |
| `Registry` | projects, MRV reports, verification votes, minting trigger, reversals |
| `Bluvft` | VFT standard (BLU token): `name`, `symbol`, `decimals`, `total_supply`, `balance_of`, `allowance`, `transfer`, `approve`, `transfer_from` + internal `mint`/`burn` (not publicly callable) |
| `Market` | listings, buy, buy_and_retire, retirements, revenue accrual & claims |

Reuse the Vara VFT standard crate/pattern (see wiki.vara.network → Standards → VFT, and the extended VFT example for mint/burn/roles). `mint`/`burn` must only be reachable from `Registry`/`Market` logic, never from an external message directly.

## 2. Units
- BLU: **1 BLU = 1 tCO2e**, `decimals = 3` → amounts are `u128` milli-tonnes (1 tCO2e = 1000).
- Prices: `u128` planck of VARA **per 1 milli-BLU** (or per whole BLU; pick one, document in IDL comments, and be consistent).
- Percentages: basis points `u16` (10 000 = 100%).
- Time: ms timestamps `u64` (`exec::block_timestamp()`); periods are `[start, end]` ms.

## 3. Types
```rust
type ProjectId = u64; type ReportId = u64; type ListingId = u64; type RetirementId = u64;

enum Role { Admin, Verifier, ProjectOwner }

enum Ecosystem { Mangrove, Seagrass, SaltMarsh }

enum ProjectStatus { Pending, Active, Suspended, Closed }

struct Beneficiary { who: ActorId, share_bps: u16 }      // sum of shares == 10_000

struct Project {
  id: ProjectId, owner: ActorId, org_id: u32,
  name: String,                    // <= 64 bytes
  ecosystem: Ecosystem,
  state_code: String,              // e.g. "GJ", "TN", "WB"
  boundary_cid: String,            // GeoJSON on IPFS
  area_ha_x100: u64,               // hectares * 100
  beneficiaries: Vec<Beneficiary>, // <= 50
  status: ProjectStatus,
  total_minted: u128, total_retired: u128,
  buffer_held: u128,               // withheld for reversal risk
  pending_revenue: u128,           // planck, unclaimed
  created_at: u64,
}

enum ReportStatus { Submitted, Verified, Rejected, Cancelled }

struct MrvReport {
  id: ReportId, project_id: ProjectId, submitter: ActorId,
  period_start: u64, period_end: u64,
  data_hash: [u8; 32],             // sha256 of report bundle
  data_cid: String,                // IPFS CID of bundle
  estimated_milli_tco2e: u128,
  methodology_version: String,     // e.g. "bc-india-0.1"
  status: ReportStatus,
  approvals: Vec<ActorId>, rejections: Vec<ActorId>,
  minted: u128, buffered: u128,
  created_at: u64,
}

struct Listing { id, project_id, seller: ActorId, remaining: u128, price_per_milli: u128, active: bool, created_at: u64 }

struct Retirement {
  id: RetirementId, project_id: ProjectId, retiree: ActorId, amount: u128,
  beneficiary_name: String,        // <= 96 bytes, who the offset is claimed for
  reason: String,                  // <= 256 bytes
  at: u64,
}

struct Params {
  quorum: u8,            // default 2
  min_orgs: u8,          // default 2 distinct verifier orgs
  buffer_bps: u16,       // default 2000 (20%) – expert-tunable
  platform_fee_bps: u16, // default 200
  treasury: ActorId,
  paused: bool,
}
```

## 4. Commands (state-changing) and queries

### Admin
| Fn | Auth | Notes |
|---|---|---|
| `grant_role(who, role, org_id)` / `revoke_role(who, role)` | Admin | Verifiers carry `org_id` |
| `set_params(Params)` | Admin | validate ranges (bps ≤ 10 000, quorum ≥ 1) |
| `pause()` / `unpause()` | Admin | blocks all state changes except `claim_revenue` |
| query `roles_of(who)`, `params()`, `verifiers(offset, limit)` | public | |

### Registry
| Fn | Auth | Rules |
|---|---|---|
| `register_project(name, ecosystem, state_code, boundary_cid, area_ha_x100, beneficiaries)` | ProjectOwner | validate lengths, shares sum = 10 000, status = Pending |
| `activate_project(id)` / `suspend_project(id)` / `close_project(id)` | Admin | |
| `set_beneficiaries(id, list)` | owner | only while `total_minted == 0` or by Admin |
| `submit_report(project_id, period_start, period_end, data_hash, data_cid, estimated_milli_tco2e, methodology_version)` | project owner | project Active; period valid and **non-overlapping** with prior verified reports; `estimate > 0` |
| `vote_report(report_id, approve: bool, note_hash: Option<[u8;32]>)` | Verifier | not owner/beneficiary of that project; one vote per verifier; on reaching `quorum` approvals across `≥ min_orgs` orgs → **finalize**; if rejections make quorum impossible → Rejected |
| `cancel_report(report_id)` | submitter | only while Submitted with 0 votes |
| `flag_reversal(project_id, amount, evidence_cid)` | Admin | reduces `buffer_held` (e.g. fire, dieback, clearing). If buffer insufficient, record `deficit` event for governance |
| queries `project(id)`, `projects(offset, limit, filter)`, `report(id)`, `reports_by_project(id, offset, limit)`, `pending_reports(offset, limit)` | public | |

**Finalize (internal)**
```
buffered = estimate * buffer_bps / 10_000
minted   = estimate - buffered
Bluvft.mint(project.owner, minted)
project.total_minted += minted ; project.buffer_held += buffered
report.status = Verified ; report.minted = minted ; report.buffered = buffered
emit ReportVerified{..}, Minted{..}
```

### Bluvft
Standard VFT API + events `Transfer`, `Approval`. Plus `Minted`/`Burned` events from internal paths.

### Market
| Fn | Auth | Rules |
|---|---|---|
| `create_listing(project_id, amount, price_per_milli)` | holder of BLU | moves `amount` BLU into program escrow (internal balance move); project Active |
| `cancel_listing(id)` | seller | returns remaining escrow |
| `buy(listing_id, amount)` **payable** | anyone | `msg value == amount * price_per_milli` exactly (reject over/under or refund the excess explicitly); BLU to buyer; `settle_value(project, value)` |
| `buy_and_retire(listing_id, amount, beneficiary_name, reason)` **payable** | anyone | same as buy but burns BLU, writes `Retirement`, increments `project.total_retired` |
| `retire(project_id, amount, beneficiary_name, reason)` | BLU holder | burn from caller; `project_id` is declared provenance and must have `total_minted - total_retired >= amount` (accounting guard) |
| `claim_revenue(project_id)` | beneficiary | share = `pending_revenue_for(caller)`; pull-payment, update state **before** transfer |
| queries `listing(id)`, `listings(offset, limit, filter)`, `retirement(id)`, `retirements_by(who, offset, limit)`, `claimable(project_id, who)` | public | |

**settle_value(project, value)**
```
fee = value * platform_fee_bps / 10_000 -> treasury accrual
net = value - fee -> project.pending_revenue
per-beneficiary entitlement tracked with an accumulator (acc_per_bps) so claims are O(1);
integer-division dust stays in the pool.
```

## 5. Events (all must be emitted; the indexer depends on them)
`RoleGranted, RoleRevoked, ParamsUpdated, Paused, Unpaused, ProjectRegistered, ProjectStatusChanged, BeneficiariesSet, ReportSubmitted, ReportVoted, ReportVerified, ReportRejected, ReportCancelled, Minted, Burned, Transfer, Approval, ReversalFlagged, ListingCreated, ListingCancelled, ListingFilled, Retired, RevenueAccrued, RevenueClaimed`

## 6. Errors (typed enum, no panics for user errors)
`Unauthorized, Paused, NotFound, InvalidInput, InvalidShares, ProjectNotActive, OverlappingPeriod, AlreadyVoted, ConflictOfInterest, QuorumImpossible, InsufficientBalance, InsufficientListing, WrongPayment, NothingToClaim, BufferDeficit, Overflow`

## 7. Invariants (write property/unit tests for each)
1. `Σ balances == total_supply`.
2. `total_supply == Σ project.total_minted − Σ burned`.
3. `project.total_retired ≤ project.total_minted`.
4. A report mints **at most once**.
5. Verifier can't vote on a project they own/benefit from, and can't vote twice.
6. `Σ beneficiary shares == 10 000` always.
7. Native VARA held by the program ≥ Σ unclaimed revenue + treasury accrual + existential deposit.
8. No arithmetic overflow (use checked ops).
9. After `pause`, only `claim_revenue` and read queries succeed.

## 8. Vara-specific implementation notes
- Use Sails `Syscall` helpers (or `gstd::msg`) for `message_source`, `message_value`, and block timestamp; native transfers via `gstd::msg::send_bytes(to, [], value)` — verify current API.
- Keep the program's balance ≥ existential deposit (check current network value).
- Prefer `BTreeMap` + paginated queries; keep every message's gas bounded.
- Strings: enforce max byte length; store hashes/CIDs not blobs.
- Emit events through the Sails events mechanism so `sails-js` can subscribe (`service.events.X.subscribe`).
- Generate `blutoken.idl` on build; commit it. Generate the TS client from the IDL with `sails-js-cli`.
- Upgrades: Gear programs are immutable once deployed. Plan migrations by deploying a new program and having Admin read-export state; keep `version()` query.

## 9. Test plan (gtest)
- Happy path: register → activate → submit → 2 votes (2 orgs) → mint math exact → list → buy_and_retire → claim_revenue.
- Quorum with same-org verifiers must NOT finalize when `min_orgs = 2`.
- Overlapping period rejected; double-vote rejected; conflict-of-interest rejected.
- Wrong payment amount rejected; re-entrancy-style double claim yields `NothingToClaim`.
- Rounding: 3 beneficiaries (3333/3333/3334 bps) with odd values — totals reconcile, dust ≤ N planck.
- Pause blocks writes; claims still work.
- Property tests on invariants 1–3 and 6–7.
- Gas/size: largest pagination query within limits.
