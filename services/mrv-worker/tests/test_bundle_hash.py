import unittest
from app.canonical_bundle import canonical_json_bytes, compute_sha256_digest
from app.pipeline import execute_mrv_pipeline

class TestBundleHash(unittest.TestCase):
    def test_canonical_json_determinism(self):
        dict1 = {"b": 2, "a": 1, "nested": {"z": 10, "y": 20}}
        dict2 = {"nested": {"y": 20, "z": 10}, "a": 1, "b": 2}

        bytes1 = canonical_json_bytes(dict1)
        bytes2 = canonical_json_bytes(dict2)

        self.assertEqual(bytes1, bytes2, "Key order must not affect canonical JSON output")
        self.assertNotIn(b" ", bytes1, "No whitespace permitted in canonical JSON")

    def test_mrv_pipeline_execution_and_commitments(self):
        bundle, sha256_hex, sha256_bytes, bundle_cid = execute_mrv_pipeline(
            project_id=1,
            period_start=1000,
            period_end=2000,
            area_ha=1000.0,
            ecosystem="Mangrove"
        )

        self.assertEqual(bundle["schema"], "blutoken.mrv.v1")
        self.assertEqual(bundle["project_id"], 1)
        self.assertGreater(bundle["estimated_milli_tco2e"], 0)
        self.assertTrue(sha256_hex.startswith("0x"))
        self.assertEqual(len(sha256_hex), 66)
        self.assertEqual(len(sha256_bytes), 32)
        self.assertTrue(bundle_cid.startswith("bafybeidemo"))

if __name__ == "__main__":
    unittest.main()
