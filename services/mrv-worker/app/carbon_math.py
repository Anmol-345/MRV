"""
BluToken Ecological Carbon Math Module
Implements multi-pool carbon stock calculations, stoichiometric tCO2e conversion,
uncertainty discounting, leakage deduction, and strict TODO rejection.
"""

from pathlib import Path
from typing import Any, Dict
import math
import yaml

# Stoichiometric ratio: 1 mole CO2 (44g) per 1 mole C (12g)
C_TO_CO2E_RATIO = 44.0 / 12.0

def _check_for_todo(obj: Any, path: str = "") -> None:
    """Recursively checks if any parameter is set to 'TODO'."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            _check_for_todo(v, f"{path}.{k}" if path else str(k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _check_for_todo(v, f"{path}[{i}]")
    elif isinstance(obj, str):
        if "TODO" in obj:
            raise RuntimeError(
                f"Production carbon parameters contain uncalibrated TODO value at '{path}': {obj}. "
                "Refusing to execute MRV calculations without scientific verification per docs/05_MRV_AI_PIPELINE.md."
            )

def load_carbon_params(params_path: Path | str, enforce_no_todo: bool = True) -> Dict[str, Any]:
    """
    Loads carbon parameters from a YAML file.
    If enforce_no_todo is True and any 'TODO' value is present, raises RuntimeError.
    """
    path = Path(params_path)
    if not path.exists():
        raise FileNotFoundError(f"Carbon parameters file not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if enforce_no_todo:
        _check_for_todo(data)

    return data

def compute_ecosystem_stock_tc(
    area_ha: float,
    ecosystem_type: str,
    params: Dict[str, Any]
) -> Dict[str, float]:
    """
    Calculates total carbon stock in tC for above-ground, below-ground, and soil pools.
    """
    ecosystem_key = ecosystem_type.lower().replace(" ", "_")
    ecosystems = params.get("ecosystems", {})
    if ecosystem_key not in ecosystems:
        raise ValueError(f"Unknown ecosystem type '{ecosystem_type}'. Supported: {list(ecosystems.keys())}")

    eco_params = ecosystems[ecosystem_key]
    agb_tc_ha = float(eco_params.get("agb_tc_ha", 0.0))
    bgb_tc_ha = float(eco_params.get("bgb_tc_ha", 0.0))
    soc_tc_ha = float(eco_params.get("soc_tc_ha", 0.0))

    agb_total = area_ha * agb_tc_ha
    bgb_total = area_ha * bgb_tc_ha
    soc_total = area_ha * soc_tc_ha
    total_stock_tc = agb_total + bgb_total + soc_total

    return {
        "area_ha": area_ha,
        "agb_tc": round(agb_total, 2),
        "bgb_tc": round(bgb_total, 2),
        "soc_tc": round(soc_total, 2),
        "total_stock_tc": round(total_stock_tc, 2)
    }

def calculate_sequestration_tco2e(
    baseline_stock_tc: float,
    current_stock_tc: float,
    ecosystem_type: str,
    params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculates net tCO2e sequestration between baseline and current observation period:
    1. delta_tc = current_stock_tc - baseline_stock_tc
    2. gross_tco2e = delta_tc * (44 / 12)
    3. uncertainty_discount = gross_tco2e * (uncertainty_pct / 100)
    4. leakage = (gross_tco2e - uncertainty_discount) * (leakage_pct / 100)
    5. net_tco2e = gross_tco2e - uncertainty_discount - leakage
    6. estimated_milli_tco2e = floor(net_tco2e * 1000)
    """
    ecosystem_key = ecosystem_type.lower().replace(" ", "_")
    eco_params = params.get("ecosystems", {}).get(ecosystem_key, {})
    uncertainty_pct = float(eco_params.get("uncertainty_pct", 10.0))
    leakage_pct = float(params.get("leakage_pct", 5.0))

    delta_tc = current_stock_tc - baseline_stock_tc
    if delta_tc <= 0.0:
        return {
            "delta_tc": round(delta_tc, 2),
            "tco2e_gross": 0.0,
            "uncertainty_discount": 0.0,
            "leakage": 0.0,
            "tco2e_net": 0.0,
            "estimated_milli_tco2e": 0
        }

    gross_tco2e = delta_tc * C_TO_CO2E_RATIO
    uncertainty_discount = gross_tco2e * (uncertainty_pct / 100.0)
    conservative_subtotal = gross_tco2e - uncertainty_discount
    leakage = conservative_subtotal * (leakage_pct / 100.0)
    net_tco2e = conservative_subtotal - leakage

    # Guaranteed integer-only milli-tCO2e for on-chain consumption
    estimated_milli_tco2e = max(0, math.floor(net_tco2e * 1000))

    return {
        "delta_tc": round(delta_tc, 2),
        "tco2e_gross": round(gross_tco2e, 3),
        "uncertainty_discount": round(uncertainty_discount, 3),
        "leakage": round(leakage, 3),
        "tco2e_net": round(net_tco2e, 3),
        "estimated_milli_tco2e": estimated_milli_tco2e
    }
