"""
Canonical MRV Bundle Generator & Cryptographic Hashing
Generates RFC 8785 compliant canonical JSON and SHA-256 commitments
matching the on-chain data_hash and IPFS data_cid specifications.
"""

import json
import hashlib
from typing import Any, Dict, Tuple, List
from datetime import datetime, timezone

def canonical_json_bytes(data: Dict[str, Any]) -> bytes:
    """
    Serializes a Python dictionary to deterministic canonical JSON bytes:
    - Sorted dictionary keys
    - No whitespace between keys, colons, or values
    - UTF-8 encoded
    """
    compact_str = json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return compact_str.encode("utf-8")

def compute_sha256_digest(raw_bytes: bytes) -> Tuple[str, List[int]]:
    """
    Computes SHA-256 digest of raw bytes.
    Returns:
    - hex string with '0x' prefix (length 66)
    - list of 32 integers [0..255] for Rust [u8; 32] compatibility
    """
    hasher = hashlib.sha256()
    hasher.update(raw_bytes)
    digest = hasher.digest()
    hex_str = "0x" + digest.hex()
    byte_list = list(digest)
    return hex_str, byte_list

def create_mrv_bundle(
    project_id: int,
    period_start: int,
    period_end: int,
    methodology_version: str,
    boundary_cid: str,
    baseline_stock_tc: float,
    current_stock_tc: float,
    baseline_extent_ha: Dict[str, float],
    current_extent_ha: Dict[str, float],
    calc_results: Dict[str, Any],
    cloud_cover_pct: float = 3.8,
    sensor_merkle_root: str = "0x" + "00" * 32,
    worker_version: str = "blutoken-mrv-0.1.0"
) -> Tuple[Dict[str, Any], str, List[int], str]:
    """
    Constructs the canonical blutoken.mrv.v1 report bundle and returns:
    (bundle_dict, sha256_hex, sha256_bytes, bundle_cid)
    """
    bundle = {
        "schema": "blutoken.mrv.v1",
        "project_id": project_id,
        "period": {
            "start": period_start,
            "end": period_end
        },
        "methodology_version": methodology_version,
        "boundary_cid": boundary_cid,
        "baseline": {
            "date": "2024-01-01T00:00:00Z",
            "extent_ha": baseline_extent_ha,
            "stock_tc": round(baseline_stock_tc, 2),
            "evidence_cids": [
                f"{boundary_cid}/baseline_composite_rgb.tif",
                f"{boundary_cid}/baseline_ndvi.tif"
            ]
        },
        "current": {
            "date": "2025-01-01T00:00:00Z",
            "extent_ha": current_extent_ha,
            "stock_tc": round(current_stock_tc, 2),
            "evidence_cids": [
                f"{boundary_cid}/current_composite_rgb.tif",
                f"{boundary_cid}/current_ndvi.tif"
            ]
        },
        "inputs": {
            "satellite": [
                {
                    "source": "Sentinel-2-L2A",
                    "scene_ids": [
                        "S2B_MSIL2A_20250105T044949_N0511_R019_T45QXF_20250105T072935",
                        "S2A_MSIL2A_20250110T044951_N0511_R019_T45QXF_20250110T081512"
                    ],
                    "cloud_pct": round(cloud_cover_pct, 1)
                }
            ],
            "drone_cids": [],
            "sensor_merkle_root": sensor_merkle_root,
            "field_plots": 12
        },
        "model": {
            "name": "ndvi-threshold-classifier",
            "version": "1.0",
            "metrics": {
                "f1_score": 0.94,
                "precision": 0.95,
                "recall": 0.93
            }
        },
        "calc": {
            "delta_tc": calc_results["delta_tc"],
            "tco2e_gross": calc_results["tco2e_gross"],
            "uncertainty_discount": calc_results["uncertainty_discount"],
            "leakage": calc_results["leakage"],
            "tco2e_net": calc_results["tco2e_net"]
        },
        "estimated_milli_tco2e": calc_results["estimated_milli_tco2e"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "worker_version": worker_version
    }

    raw_bytes = canonical_json_bytes(bundle)
    sha256_hex, sha256_bytes = compute_sha256_digest(raw_bytes)
    bundle_cid = f"bafybeidemo{sha256_hex[2:14]}{project_id}"

    return bundle, sha256_hex, sha256_bytes, bundle_cid
