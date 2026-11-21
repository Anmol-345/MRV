# 05 – MRV & AI Pipeline

**MRV = Monitoring → Reporting → Verification.** This doc defines how a report's `estimated_milli_tco2e` is produced and checked. A marine/coastal-carbon expert (e.g. NCCR) must review all coefficients before real use.

## 1. Monitoring (data capture)
| Source | Use | Notes |
|---|---|---|
| Sentinel-2 (via Earth Engine) | NDVI/EVI, mangrove extent, canopy change | 10 m, ~5-day revisit; cloud-mask with SCL/QA bands |
| Landsat 8/9 | long baseline (back to 1980s via Landsat 5) | 30 m |
| Bhuvan (ISRO) | Indian land-cover / coastal layers, cross-check | check access terms/API availability |
| Drones | high-res orthomosaics for plots, seagrass/salt-marsh edges | store orthomosaic CID + flight metadata |
| IoT sensors | pH, salinity, soil carbon, water level | signed batches (see `docs/04_OFFCHAIN_BACKEND.md`) |
| Field plots | tree diameter/height, soil cores, seagrass cover | entered via mobile app; lab results attached |

## 2. Analysis steps (MRV worker job)
Input: `project_id, period_start, period_end`.
1. Load boundary polygon (GeoJSON from IPFS).
2. **Baseline**: use the last verified report's end-state; for a first report, use a documented baseline date and imagery (store its CID).
3. **Classify extent** per ecosystem for start and end of period:
   - MVP: index thresholds (NDVI / NDWI / mangrove-specific indices) with cloud masking and median composites.
   - Later: TensorFlow segmentation model (U-Net) on Sentinel-2 patches; OpenCV for drone image processing. Version models; store `model_version`, metrics.
4. **Area change** (ha) per class with uncertainty.
5. **Carbon stock** = area × carbon density per pool (above-ground biomass, below-ground biomass, soil organic carbon) from `carbon_params.yaml`.
6. **Δ stock** between baseline and end → tC. Convert: **tCO2e = tC × 44/12**.
7. Apply: uncertainty discount (conservative lower bound), leakage deduction (if configured), and exclude non-additional areas. Output `estimated_milli_tco2e = floor(tCO2e × 1000)`.
8. Build **report bundle** (JSON + evidence references), compute `sha256`, pin to IPFS.

`carbon_params.yaml` (PLACEHOLDER – domain expert must populate with cited values, e.g. IPCC 2013 Wetlands Supplement defaults or the India-specific studies referenced in the deck; each value needs `source`, `year`, `region`):
```yaml
methodology_version: "bc-india-0.1"
ecosystems:
  mangrove:   { agb_tc_ha: TODO, bgb_tc_ha: TODO, soc_tc_ha: TODO, uncertainty_pct: TODO }
  seagrass:   { agb_tc_ha: TODO, bgb_tc_ha: TODO, soc_tc_ha: TODO, uncertainty_pct: TODO }
  salt_marsh: { agb_tc_ha: TODO, bgb_tc_ha: TODO, soc_tc_ha: TODO, uncertainty_pct: TODO }
leakage_pct: TODO
```
The worker must **refuse to run** if any `TODO` remains (fail loudly rather than output fake numbers). For demos use a clearly named `demo_params.yaml` and tag outputs `DEMO`.

## 3. Report bundle schema (`bundle.json`)
```json
{
  "schema": "blutoken.mrv.v1",
  "project_id": 12,
  "period": {"start": 1735689600000, "end": 1743465600000},
  "methodology_version": "bc-india-0.1",
  "boundary_cid": "bafy...",
  "baseline": {"date": "2024-01-01", "extent_ha": {"mangrove": 0}, "stock_tc": 0, "evidence_cids": []},
  "current":  {"date": "2025-03-31", "extent_ha": {"mangrove": 0}, "stock_tc": 0, "evidence_cids": []},
  "inputs": {"satellite": [{"source":"S2","scene_ids":[],"cloud_pct":0}], "drone_cids": [], "sensor_merkle_root": "0x..", "field_plots": 0},
  "model": {"name": "ndvi-threshold", "version": "0.1", "metrics": {}},
  "calc": {"delta_tc": 0, "tco2e_gross": 0, "uncertainty_discount": 0, "leakage": 0, "tco2e_net": 0},
  "estimated_milli_tco2e": 0,
  "generated_at": "ISO-8601",
  "worker_version": "git-sha"
}
```
Use canonical JSON (sorted keys, no whitespace) before hashing so everyone computes the same `sha256`.

## 4. Verification rules (human + automatic)
Automatic checks shown to verifiers (red/amber/green):
- Hash of fetched bundle == on-chain `data_hash`.
- Period doesn't overlap prior verified reports; boundary unchanged.
- Cloud cover and scene count within limits; no large data gaps.
- Estimate within configured bounds relative to area (flag outliers).
- Sensor signature failures < threshold; sensor uptime ok.
- Recompute: verifier UI can trigger the worker's `verify` endpoint to independently recompute from the same scene ids and compare within tolerance.

Human checks: spot-check imagery, field evidence, conflicts of interest. Votes carry an optional note whose hash goes on-chain and text off-chain.

## 5. Fraud & anomaly signals
Sudden NDVI jumps, duplicated imagery, overlapping boundaries across projects (spatial join), same device submitting from impossible locations, citizen reports contradicting claimed health. Surface as alerts on the gov dashboard; do not auto-reject.

## 6. Worker API
```
POST /jobs            {project_id, period_start, period_end} -> {job_id}
GET  /jobs/:id        -> {status, progress, result?{bundle_cid, sha256, estimated_milli_tco2e}}
POST /verify/:cid     -> recompute + diff report
GET  /observations    -> time series for dashboards
```
Jobs are async (queue), idempotent by `(project, period, methodology_version)`, and callback to the API on completion.
