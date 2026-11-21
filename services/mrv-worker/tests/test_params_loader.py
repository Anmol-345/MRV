import unittest
from pathlib import Path
from app.carbon_math import load_carbon_params

class TestParamsLoader(unittest.TestCase):
    def test_production_params_with_todo_strictly_rejected(self):
        prod_path = Path(__file__).parent.parent / "app" / "carbon_params.yaml"
        self.assertTrue(prod_path.exists(), "carbon_params.yaml must exist")

        with self.assertRaises(RuntimeError) as ctx:
            load_carbon_params(prod_path, enforce_no_todo=True)

        self.assertIn("TODO", str(ctx.exception))
        self.assertIn("Refusing to execute", str(ctx.exception))

    def test_demo_params_loads_successfully(self):
        demo_path = Path(__file__).parent.parent / "app" / "demo_params.yaml"
        self.assertTrue(demo_path.exists(), "demo_params.yaml must exist")

        params = load_carbon_params(demo_path, enforce_no_todo=True)
        self.assertEqual(params["tag"], "DEMO")
        self.assertIn("mangrove", params["ecosystems"])
        self.assertGreater(params["ecosystems"]["mangrove"]["agb_tc_ha"], 0)

if __name__ == "__main__":
    unittest.main()
