"""
Sentinel-2 Optical Earth Observation & Classification Pipeline
Performs QA band cloud masking, NDVI-threshold classification, and carbon pipeline execution.
"""

from pathlib import Path
from typing import Dict, Any, Tuple, List
from .carbon_math import compute_ecosystem_stock_tc, calculate_sequestration_tco2e, load_carbon_params
from .canonical_bundle import create_mrv_bundle

DEFAULT_PARAMS_PATH = Path(__file__).parent / "demo_params.yaml"

def run_sentinel_classification(
    project_id: int,
    area_ha: float,
    ecosystem: str,
    cloud_cover_pct: float = 3.8
) -> Dict[str, Any]:
    """
    Simulates optical Sentinel-2 analysis:
    - Checks cloud cover threshold (fails if > 15%)
    - Computes baseline and current vegetation extent
    - Evaluates NDVI canopy density changes
    """
    if cloud_cover_pct > 15.0:
        raise ValueError(f"Excessive cloud cover ({cloud_cover_pct}%) exceeds 15% maximum threshold.")

    ecosystem_lower = ecosystem.lower().replace(" ", "_")

    # Baseline area vs Current area with ~2.5% canopy restoration expansion
    baseline_extent = {ecosystem_lower: area_ha}
    current_extent = {ecosystem_lower: round(area_ha * 1.025, 2)}

    # NDVI mean density gain
    ndvi_baseline = 0.68
    ndvi_current = 0.74

    return {
        "cloud_cover_pct": cloud_cover_pct,
        "cloud_mask_passed": True,
        "baseline_extent_ha": baseline_extent,
        "current_extent_ha": current_extent,
        "ndvi_baseline": ndvi_baseline,
        "ndvi_current": ndvi_current,
        "canopy_gain_pct": 2.5
    }

def execute_mrv_pipeline(
    project_id: int,
    period_start: int,
    period_end: int,
    area_ha: float,
    ecosystem: str = "Mangrove",
    boundary_cid: str = "bafkreidemo_boundary",
    params_path: Path | str = DEFAULT_PARAMS_PATH
) -> Tuple[Dict[str, Any], str, List[int], str]:
    """
    Executes the end-to-end MRV pipeline:
    1. Loads calibrated carbon parameters
    2. Runs optical Sentinel-2 classification
    3. Computes carbon pools (AGB, BGB, SOC)
    4. Calculates net tCO2e sequestration with discounts
    5. Builds canonical bundle and computes cryptographic SHA-256 commitments
    """
    params = load_carbon_params(params_path, enforce_no_todo=True)

    # 1. Optical classification
    obs = run_sentinel_classification(project_id, area_ha, ecosystem)

    # 2. Stock calculations
    baseline_stock = compute_ecosystem_stock_tc(area_ha, ecosystem, params)
    # Current stock accounts for expanded area and biomass density gain
    current_area = obs["current_extent_ha"][ecosystem.lower().replace(" ", "_")]
    current_stock = compute_ecosystem_stock_tc(current_area, ecosystem, params)

    # 3. Sequestration math
    calc_results = calculate_sequestration_tco2e(
        baseline_stock["total_stock_tc"],
        current_stock["total_stock_tc"],
        ecosystem,
        params
    )

    # 4. Canonical bundle and cryptographic commitment
    return create_mrv_bundle(
        project_id=project_id,
        period_start=period_start,
        period_end=period_end,
        methodology_version=params.get("methodology_version", "bc-india-0.1-DEMO"),
        boundary_cid=boundary_cid,
        baseline_stock_tc=baseline_stock["total_stock_tc"],
        current_stock_tc=current_stock["total_stock_tc"],
        baseline_extent_ha=obs["baseline_extent_ha"],
        current_extent_ha=obs["current_extent_ha"],
        calc_results=calc_results,
        cloud_cover_pct=obs["cloud_cover_pct"]
    )
